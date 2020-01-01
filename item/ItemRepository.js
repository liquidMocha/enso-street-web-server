import database from '../database';
import UserRepository from "../user/UserRepository";
import ItemDTO from "./ItemDTO";
import ImageRepository from "./ImageRepository";
import ItemDAO from "./ItemDAO";

export default class ItemRepository {

    static updateItem = (updatedItem) => {
        return database.none(
                `UPDATE public.item
                 SET rentaldailyprice = COALESCE($1, rentaldailyprice),
                     searchable       = COALESCE($2, searchable)
                 WHERE id = $3`,
            [updatedItem.rentalDailyPrice, updatedItem.searchable, updatedItem.id]);
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
                              where id = $1`, [itemId])
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

    static saveItem = (itemDAO) => {
        const conditionId = ItemRepository.getConditionId(itemDAO.condition);
        const ownerUserId = UserRepository.findOne({email: itemDAO.ownerEmail});

        return Promise.all([conditionId, ownerUserId])
            .then((values) => {
                const conditionId = values[0];
                const userId = values[1].id;
                //sanitize lat lon
                const geographicLocation = `ST_GeomFromEWKT('SRID=4326;POINT(${itemDAO.location.longitude} ${itemDAO.location.latitude})')`;
                return database.one(
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
                                                 zipCode)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ${geographicLocation}, $11, $12, $13, $14)
                         RETURNING id`,
                    [
                        itemDAO.title,
                        itemDAO.rentalDailyPrice,
                        itemDAO.deposit,
                        conditionId,
                        itemDAO.description,
                        itemDAO.canBeDelivered,
                        itemDAO.deliveryStarting,
                        itemDAO.deliveryAdditional,
                        userId,
                        true,
                        itemDAO.location.street,
                        itemDAO.location.city,
                        itemDAO.location.state,
                        itemDAO.location.zipCode
                    ],
                    result => result.id
                );
            }).catch(error => {
                throw new Error(`Error when saving item: ${error}`);
            });
    };

    static save = (itemDAO) => {
        const eventualItemId = ItemRepository.saveItem(itemDAO);

        const saveCategoriesPromises = eventualItemId
            .then(itemId => {
                return this.saveCategories(itemDAO.categories, itemId);
            })
            .catch(error => {
                throw new Error(`Error when creating item: ${error}`);
            });

        eventualItemId.then(itemId => {
            const imageUrl = `https://${process.env.Bucket}.s3.amazonaws.com/${itemId}`;

            return database.none(`UPDATE item
                                  SET image_url = $1
                                  WHERE item.id = $2;`,
                [imageUrl, itemId])
        }).catch(error => {
            console.error(`Error when updating item image url. ${error}`);
            throw new Error('Error when updating item image url.')
        });

        const signedRequestPromise = eventualItemId.then(itemId => {
            return ImageRepository.getSignedS3Request(itemId);
        });

        return Promise.all([signedRequestPromise, saveCategoriesPromises])
            .then(values => {
                return values[0];
            });
    };

    static saveCategories = (categories, itemId) => {
        return Promise.all(categories.map(category => {
            return database.one(
                    `SELECT id
                     FROM public.category
                     WHERE name = $1`,
                [category]
            ).then(categoryId => {
                return database.none(
                        `INSERT INTO public.itemToCategory (categoryId, itemId)
                         VALUES ($1, $2);`, [categoryId.id, itemId]);
            })
        }));
    };

    static getItemsForUser = (userEmail) => {
        return UserRepository.findOne({email: userEmail})
            .then(user => {
                if (user) {
                    return database.manyOrNone(
                            `SELECT item.id,
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
                                    category.name                     AS categoryname,
                                    item.image_url,
                                    item.created_on,
                                    item.searchable,
                                    ST_X(item.geo_location::geometry) AS longitude,
                                    ST_Y(item.geo_location::geometry) AS latitude
                             FROM item
                                      JOIN condition ON item.condition = condition.id
                                      JOIN itemtocategory ON itemtocategory.itemid = item.id
                                      JOIN category ON itemtocategory.categoryid = category.id
                             WHERE item.owner = $1
                               AND item.archived != TRUE`,
                        [user.id]
                    )
                } else {
                    throw new Error(`User not found.`);
                }
            })
            .then((entities) => {
                const resultIds = [];
                const result = [];
                entities.forEach(itemEntity => {
                    if (resultIds.includes(itemEntity.id)) {
                        result.find(element => element.id === itemEntity.id).addCategory(itemEntity.categoryname);
                    } else {
                        resultIds.push(itemEntity.id);
                        result.push(new ItemDTO({
                            id: itemEntity.id,
                            title: itemEntity.title,
                            rentalDailyPrice: itemEntity.rentaldailyprice,
                            deposit: itemEntity.deposit,
                            condition: itemEntity.condition,
                            categories: [itemEntity.categoryname],
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
                                longitude: itemEntity.longitude
                            },
                            imageUrl: itemEntity.image_url,
                            searchable: itemEntity.searchable
                        }))
                    }
                });
                return result;
            })
            .catch(error => {
                throw new Error(`Error when retrieving items: ${error}`);
            });
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