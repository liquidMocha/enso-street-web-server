import database from '../database';
import UserRepository from "../user/UserRepository";
import ItemDTO from "./ItemDTO";
import ItemDAO from "./ItemDAO";

export default class ItemRepository {
    static updateItem = (updatedItem) => {
        let eventualConditionId;
        if (updatedItem.condition) {
            eventualConditionId = ItemRepository.getConditionId(updatedItem.condition);
        } else {
            eventualConditionId = Promise.resolve();
        }

        let eventualCategoriesSaved;
        if (updatedItem.categories) {
            eventualCategoriesSaved = ItemRepository.saveCategories(updatedItem.categories, updatedItem.id);
        } else {
            eventualCategoriesSaved = Promise.resolve();
        }

        let geographicLocation = null;
        if (updatedItem.location) {
            geographicLocation = ItemRepository.getGeographicLocationFrom(
                updatedItem.location.longitude, updatedItem.location.latitude);
        }

        return eventualConditionId
            .then(conditionId => {
                return Promise.all([
                    eventualCategoriesSaved,
                    database.none(
                        `UPDATE public.item
                             SET rentaldailyprice   = COALESCE($1, rentaldailyprice),
                                 searchable         = COALESCE($2, searchable),
                                 title              = COALESCE($3, title),
                                 condition          = COALESCE($4, condition),
                                 description        = COALESCE($5, description),
                                 canbedelivered     = COALESCE($6, canbedelivered),
                                 deliverystarting   = COALESCE($7, deliverystarting),
                                 deliveryadditional = COALESCE($8, deliveryadditional),
                                 deposit            = COALESCE($9, deposit),
                                 street             = COALESCE($10, street),
                                 zipcode            = COALESCE($11, zipcode),
                                 city               = COALESCE($12, city),
                                 state              = COALESCE($13, state),
                                 geo_location       = COALESCE(${geographicLocation}, geo_location),
                                 image_url          = COALESCE($14, image_url)
                             WHERE id = $15`,
                        [
                            updatedItem.rentalDailyPrice,
                            updatedItem.searchable,
                            updatedItem.title,
                            conditionId,
                            updatedItem.description,
                            updatedItem.canBeDelivered,
                            updatedItem.deliveryStarting,
                            updatedItem.deliveryAdditional,
                            updatedItem.deposit,
                            updatedItem.location ? updatedItem.location.street : null,
                            updatedItem.location ? updatedItem.location.zipCode : null,
                            updatedItem.location ? updatedItem.location.city : null,
                            updatedItem.location ? updatedItem.location.state : null,
                            updatedItem.imageUrl,
                            updatedItem.id
                        ])]
                );
            })
            .catch(error => {
                console.error(`Error when updating item ID: ${updatedItem.id}`);
                throw new Error(`Error when updating item: ${error}`);
            });
    };

    static getConditionId = (condition) => {
        return database.one(`SELECT id
                             FROM public.condition
                             WHERE condition = $1`,
            [condition],
            result => result.id
        );
    };

    static archive = (itemId) => {
        return database.none(`UPDATE public.item
                              SET archived = true
                              where id = $1`,
            [itemId]
        )
    };

    static getItemById = (itemId) => {
        return database.one(`SELECT owner
                             FROM public.item
                             WHERE id = $1`, [itemId]
        ).then(result => {
            return result.owner;
        }).then(ownerId => {
            return UserRepository.getEmailById(ownerId);
        }).then(ownerEmail => {
            return new ItemDAO({
                id: itemId,
                ownerEmail: ownerEmail
            })
        }).catch(error => {
            throw new Error(`Error when retrieving item information: ${error}`);
        })
    };

    static getGeographicLocationFrom = (longitude, latitude) => {
        return `ST_GeomFromEWKT('SRID=4326;POINT(${longitude} ${latitude})')`
    };

    static saveItem = async (itemDAO) => {
        const conditionId = ItemRepository.getConditionId(itemDAO.condition);
        const ownerUserId = UserRepository.findOne({email: itemDAO.ownerEmail});

        const geographicLocation = ItemRepository.getGeographicLocationFrom(
            itemDAO.location.longitude, itemDAO.location.latitude);

        const [resolvedConditionId, resolvedOwner] =
            await Promise.all([conditionId, ownerUserId]);

        const savedItem = database.one(
            `INSERT INTO public.item(title,
                                                 rentalDailyPrice,
                                                 deposit,
                                                 condition,
                                                 description,
                                                 canBeDelivered,
                                                 deliveryStarting,
                                                 deliveryAdditional,
                                                 owner,
                                                 searchable,
                                                 geo_location,
                                                 street,
                                                 city,
                                                 state,
                                                 zipCode,
                                                 image_url)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ${geographicLocation}, $11, $12, $13, $14, $15)
                         RETURNING id, title, description, 
                             ST_X(item.geo_location::geometry) AS longitude,
                             ST_Y(item.geo_location::geometry) AS latitude`,
            [
                itemDAO.title,
                itemDAO.rentalDailyPrice,
                itemDAO.deposit,
                resolvedConditionId,
                itemDAO.description,
                itemDAO.canBeDelivered,
                itemDAO.deliveryStarting,
                itemDAO.deliveryAdditional,
                resolvedOwner.id,
                true,
                itemDAO.location.street,
                itemDAO.location.city,
                itemDAO.location.state,
                itemDAO.location.zipCode,
                itemDAO.imageUrl
            ],
            result => result
        );

        const categoriesSaved = this.saveCategories(itemDAO.categories, (await savedItem).id);

        return {
            ...(await savedItem),
            categories: [...(await categoriesSaved)]
        };
    };

    static save = (itemDAO) => {
        try {
            return ItemRepository.saveItem(itemDAO);
        } catch (error) {
            console.error(`Error when creating item: ${error}`);
            throw new Error('Error when creating item.');
        }
    };

    static saveCategories = (categories, itemId) => {
        return database.tx(async t => {
            await t.none(`DELETE
                          FROM public.itemtocategory
                          WHERE itemid = $1`, itemId
            );

            await t.none(`INSERT INTO public.itemtocategory (categoryid, itemid)
                          SELECT category.id, $1
                          FROM category
                          WHERE category.name IN ($2:csv)`, [itemId, categories]);

            const savedCategories = await t.many(`SELECT name
                                                  FROM category
                                                  WHERE name IN ($1:csv)`, [categories]);

            return savedCategories.map(savedCategory => savedCategory.name);
        });
    };

    static getItemsForUser = async (userEmail) => {
        const user = await UserRepository.findOne({email: userEmail});

        if (user) {
            return await database.task(t => {
                return t.map(`SELECT item.id,
                                     item.title,
                                     item.rentaldailyprice,
                                     item.deposit,
                                     condition.condition,
                                     item.description,
                                     item.canbedelivered,
                                     item.deliverystarting,
                                     item.deliveryadditional,
                                     item.street,
                                     item.zipcode,
                                     item.city,
                                     item.state,
                                     item.image_url,
                                     item.created_on,
                                     item.searchable,
                                     ST_X(item.geo_location::geometry) AS longitude,
                                     ST_Y(item.geo_location::geometry) AS latitude
                              FROM item
                                       JOIN condition ON item.condition = condition.id
                              WHERE item.owner = $1
                                AND item.archived != TRUE`,
                    [user.id], item => {
                        return t.any(`SELECT name
                                      FROM itemtocategory
                                               JOIN category c ON itemtocategory.categoryid = c.id
                                      WHERE itemid = $1`, [item.id])
                            .then(categories => {
                                item.categories = categories.map(category => category.name);
                                return item;
                            })
                    }).then(t.batch);
            }).then(itemEntities => {
                return itemEntities.map(itemEntity => {
                    return new ItemDTO({
                        id: itemEntity.id,
                        title: itemEntity.title,
                        rentalDailyPrice: itemEntity.rentaldailyprice,
                        deposit: itemEntity.deposit,
                        condition: itemEntity.condition,
                        categories: itemEntity.categories,
                        description: itemEntity.description,
                        canBeDelivered: itemEntity.canbedelivered,
                        deliveryStarting: itemEntity.deliverystarting,
                        deliveryAdditional: itemEntity.deliveryadditional,
                        createdOn: itemEntity.created_on,
                        location: {
                            street: itemEntity.street,
                            zipCode: itemEntity.zipcode,
                            city: itemEntity.city,
                            state: itemEntity.state,
                            latitude: itemEntity.latitude,
                            longitude: itemEntity.longitude,
                        },
                        imageUrl: itemEntity.image_url,
                        searchable: itemEntity.searchable
                    })
                });
            });
        } else {
            throw new Error(`User not found.`);
        }
    };

    static getItemsInRangeFrom = ({latitude, longitude}, rangeInMiles) => {
        return database.manyOrNone(
                `SELECT id,
                        title,
                        rentaldailyprice,
                        city,
                        zipcode,
                        ST_X(item.geo_location::geometry) AS longitude,
                        ST_Y(item.geo_location::geometry) AS latitude
                 FROM item
                 WHERE ST_Distance_Sphere(geo_location::geometry, ST_MakePoint($1, $2)) <= $3 * 1609.34
                   AND archived != true
                   AND searchable = true`,
            [longitude, latitude, rangeInMiles]
        )
    };
}