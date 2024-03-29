import database from '../database.js';
import {Condition} from "./Condition";
import {Item} from "./Item";
import {Coordinates} from "../location/Coordinates";
import {Category} from "../category/Category";
import ItemLocation from "./ItemLocation";
import Address from "../location/Address";
import Index from "../search/Index";
import {Owner} from "./Owner";

export const update = async (item: Item): Promise<void> => {
    const condition = getConditionId(item.condition);
    const geographicLocation = getGeographicLocationFrom(item.location.coordinates);

    await database.tx(async t => {
        const updateItem = t.none(`
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

        const updateCategories = saveCategories(item.categories, item.id);
        return Promise.all([updateItem, updateCategories])
    })

    if (item.archived || !item.searchable) {
        await Index.deleteItemIndex(item);
    } else {
        await Index.updateItemIndex(item);
    }
}

export const getItemByIds = async (itemIds: string[]): Promise<(Item)[]> => {
    if (itemIds.length === 0) {
        return [];
    }

    return await Promise.all(itemIds.map(async id => await getItemById(id)))
};

export const getItemById = async (itemId: string): Promise<Item> => {
    return database.tx(async t => {
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
                                   public.user.id                          as ownerId,
                                   public."user".stripe_connect_account_id as stripeAccountId,
                                   up.name,
                                   ST_X(item.geo_location::geometry)       AS longitude,
                                   ST_Y(item.geo_location::geometry)       AS latitude
                            FROM item
                                     JOIN condition ON item.condition = condition.id
                                     JOIN public.user ON item.owner = "user".id
                                     JOIN public.user_profile up ON "user".id = up.user_id
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
                            city: itemEntity.city,
                            state: itemEntity.state,
                            zipCode: itemEntity.zipcode
                        }
                    ),
                    new Coordinates(itemEntity.latitude, itemEntity.longitude)
                ),
                owner: new Owner(itemEntity.ownerid, itemEntity.email, itemEntity.name, itemEntity.stripeaccountid),
                searchable: itemEntity.searchable,
                archived: itemEntity.archived,
                createdOn: itemEntity.created_on
            }
        );
    })
};

export const getItemsForUser = async (userId: string): Promise<Item[]> => {
    const itemIds = database.map(
            `SELECT id
             FROM item
             WHERE owner = $1`,
        [userId],
        data => data.id
    );
    return getItemByIds(await itemIds);
};

export const save = async (item: Item) => {
    try {
        await saveItem(item);
        await Index.indexItem(item);
    } catch (error) {
        console.error(`Error when creating item: ${JSON.stringify(error)}`);
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

const getConditionId = (condition: Condition): Promise<number> => {
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
        const geographicLocation = getGeographicLocationFrom(item.location.coordinates);

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
                await conditionId,
                item.description,
                item.canBeDelivered,
                item.deliveryStarting,
                item.deliveryAdditional,
                item.owner.id,
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
        console.trace(`Error when creating item: ${e}`);
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
