import database from '../database.js';
// @ts-ignore
import UserRepository from "../user/UserRepository";
import {Condition} from "./Condition";
import {Item} from "./Item";
import {Coordinates} from "../location/Coordinates";
import {Category} from "../category/Category";
import ItemLocation from "./ItemLocation";
import Address from "../location/Address";
import Index from "../search/Index";

export const update = async (item: Item): Promise<void> => {
    const condition = getConditionId(item.condition);
    const geographicLocation = getGeographicLocationFrom(item.location.coordinates);

    await database.none(`
        UPDATE public.item
        SET title              = $1,
            description        = $2,
            image_url          = $3,
            rentaldailyprice   = $4,
            deposit            = $5,
            condition          = $6,
            canbedelivered     = $7,
            deliverystarting   = $8,
            deliveryadditional = $9,
            street             = $10,
            city               = $11,
            state              = $12,
            zipcode            = $13,
            geo_location       = ${geographicLocation},
            searchable         = $14,
            archived           = $15
        WHERE id = $16
    `, [
        item.title,
        item.description,
        item.imageUrl,
        item.rentalDailyPrice,
        item.deposit,
        await condition,
        item.canBeDelivered,
        item.deliveryStarting,
        item.deliveryAdditional,
        item.location.address.street,
        item.location.address.city,
        item.location.address.state,
        item.location.address.zipCode,
        item.searchable,
        item.archived,
        item.id
    ]);

    await saveCategories(item.categories, item.id);

    if (item.archived || !item.searchable) {
        await Index.deleteItemIndex(item);
    } else {
        await Index.updateItemIndex(item);
    }
}

export const getItemByIds = (itemIds: string[]): Promise<Item[]> => {
    if (itemIds.length === 0) {
        return Promise.resolve([]);
    }

    return Promise.all(itemIds.map(async id => await getItemById(id)))
};

export const getItemById = async (itemId: string): Promise<Item> => {
    return database.task(async t => {
        return await t.one(`SELECT item.id,
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
                                   item.archived,
                                   public.user.email,
                                   ST_X(item.geo_location::geometry) AS longitude,
                                   ST_Y(item.geo_location::geometry) AS latitude
                            FROM item
                                     JOIN condition ON item.condition = condition.id
                                     JOIN public.user ON item.owner = "user".id
                            WHERE item.id = $1`,
            [itemId],
            item => {
                return t.any(`SELECT name
                              FROM itemtocategory
                                       JOIN category c ON itemtocategory.categoryid = c.id
                              WHERE itemid = $1`, [item.id])
                    .then(categories => {
                        item.categories = categories.map(category => category.name);
                        return item;
                    })
            });
    }).then(itemEntity => {
        return new Item(
            {
                id: itemEntity.id,
                title: itemEntity.title,
                description: itemEntity.description,
                categories: itemEntity.categories,
                imageUrl: itemEntity.image_url,
                rentalDailyPrice: parseFloat(itemEntity.rentaldailyprice),
                deposit: parseFloat(itemEntity.deposit),
                condition: itemEntity.condition,
                canBeDelivered: itemEntity.canbedelivered,
                deliveryStarting: parseFloat(itemEntity.deliverystarting),
                deliveryAdditional: parseFloat(itemEntity.deliveryadditional),
                location: new ItemLocation(
                    new Address(
                        {
                            street: itemEntity.street,
                            city: itemEntity.zipcode,
                            state: itemEntity.city,
                            zipCode: itemEntity.state
                        }
                    ),
                    new Coordinates(itemEntity.latitude, itemEntity.longitude)
                ),
                ownerEmail: itemEntity.email,
                searchable: itemEntity.searchable,
                archived: itemEntity.archived,
                createdOn: itemEntity.created_on
            }
        );
    })
};

export const save = async (item: Item) => {
    try {
        await saveItem(item);
        await Index.indexItem(item);
    } catch (error) {
        console.error(`Error when creating item: ${error}`);
        throw new Error('Error when creating item.');
    }
};

export const getItemsForUser = async (userEmail: string): Promise<Item[]> => {
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
                                 item.archived,
                                 ST_X(item.geo_location::geometry) AS longitude,
                                 ST_Y(item.geo_location::geometry) AS latitude
                          FROM item
                                   JOIN condition ON item.condition = condition.id
                          WHERE item.owner = $1`,
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
                return new Item(
                    {
                        id: itemEntity.id,
                        title: itemEntity.title,
                        description: itemEntity.description,
                        categories: itemEntity.categories,
                        imageUrl: itemEntity.image_url,
                        rentalDailyPrice: itemEntity.rentaldailyprice,
                        deposit: itemEntity.deposit,
                        condition: itemEntity.condition,
                        canBeDelivered: itemEntity.canbedelivered,
                        deliveryStarting: itemEntity.deliverystarting,
                        deliveryAdditional: itemEntity.deliveryadditional,
                        location: new ItemLocation(
                            new Address(
                                {
                                    street: itemEntity.street,
                                    city: itemEntity.city,
                                    state: itemEntity.state,
                                    zipCode: itemEntity.zipcode
                                }
                            ),
                            new Coordinates(itemEntity.latitude, itemEntity.longitude)
                        ),
                        ownerEmail: itemEntity.email,
                        searchable: itemEntity.searchable,
                        archived: itemEntity.archived,
                        createdOn: itemEntity.created_on
                    }
                )
            });
        });
    } else {
        throw new Error(`User not found.`);
    }
};

export const findOwnerForItem = (itemId: string) => {
    return database.one(
            `SELECT owner
             FROM item
             WHERE id = $1`,
        [itemId],
        result => result.owner);
};

const getConditionId = (condition: Condition) => {
    return database.one(`SELECT id
                         FROM public.condition
                         WHERE condition = $1`,
        [condition],
        result => result.id
    );
};

const getGeographicLocationFrom = (coordinates: Coordinates) => {
    return `ST_GeomFromEWKT('SRID=4326;POINT(${coordinates.longitude} ${coordinates.latitude})')`
};

const saveItem = async (item: Item) => {
    try {
        const conditionId = getConditionId(item.condition);
        const ownerUserId = UserRepository.findOne({email: item.ownerEmail});

        const geographicLocation = getGeographicLocationFrom(item.location.coordinates);

        const [resolvedConditionId, resolvedOwner] =
            await Promise.all([conditionId, ownerUserId]);

        const savedItem = database.one(
            `INSERT INTO public.item(
                         title,
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
                         image_url,
                         id)
                         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, ${geographicLocation}, $11, $12, $13, $14, $15, $16)
                         RETURNING id, title, description, 
                             deposit, rentaldailyprice, deliveryadditional,
                             deliverystarting, condition, description, image_url,
                             canbedelivered,
                             ST_X(item.geo_location::geometry) AS longitude,
                             ST_Y(item.geo_location::geometry) AS latitude`,
            [
                item.title,
                item.rentalDailyPrice,
                item.deposit,
                resolvedConditionId,
                item.description,
                item.canBeDelivered,
                item.deliveryStarting,
                item.deliveryAdditional,
                resolvedOwner.id,
                true,
                item.location.address.street,
                item.location.address.city,
                item.location.address.state,
                item.location.address.zipCode,
                item.imageUrl,
                item.id
            ],
            result => result
        );

        const categoriesSaved = saveCategories(item.categories, (await savedItem).id);

        return {
            ...(await savedItem),
            rentalDailyPrice: parseFloat((await savedItem).rentaldailyprice),
            deposit: parseFloat((await savedItem).deposit),
            deliveryStarting: parseFloat((await savedItem).deliverystarting),
            deliveryAdditional: parseFloat((await savedItem).deliveryadditional),
            categories: [...(await categoriesSaved)]
        };
    } catch (e) {
        console.log(`Error when creating item: ${e}`);
    }
};

const saveCategories = (categories: Category[], itemId: string) => {
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
