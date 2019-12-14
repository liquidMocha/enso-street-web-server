import database from '../database';
import UserService from "../user/UserService";
import ItemDTO from "./ItemDTO";
import ImageRepository from "./ImageRepository";
import ItemDAO from "./ItemDAO";

export default class ItemRepository {
    static getConditionId = (condition) => {
        return database.one("select id " +
            "from public.condition " +
            "where condition = $1",
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
        return database.one(`select owner
                             from public.item
                             where id = $1`, [itemId]
        ).then(result => {
            return result.owner;
        }).then(ownerId => {
            return UserService.getEmailById(ownerId);
        }).then(ownerEmail => {
            return new ItemDAO({
                id: itemId,
                ownerEmail: ownerEmail
            })
        }).catch(error => {
            throw new Error("Error when retrieving item information: " + error);
        })
    };

    static saveItem = (itemDAO) => {
        const conditionId = ItemRepository.getConditionId(itemDAO.condition);
        const ownerUserId = UserService.findOne({email: itemDAO.ownerEmail});
        const locationId = itemDAO.location.id || ownerUserId
            .then(user => {
                return LocationRepository.createLocation(itemDAO.location, user.id);
            })
            .catch(error => {
                throw new Error("Error creating location for user: " + itemDAO.ownerEmail);
            });

        return Promise.all([conditionId, ownerUserId, locationId])
            .then((values) => {
                const conditionId = values[0];
                const userId = values[1].id;
                const locationId = values[2];
                return database.one(
                        `insert into public.item(title,
                                                 rentalDailyPrice,
                                                 deposit,
                                                 condition,
                                                 description,
                                                 canBeDelivered,
                                                 deliveryStarting,
                                                 deliveryAdditional,
                                                 location,
                                                 owner)
                         values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                         returning id`,
                    [
                        itemDAO.title,
                        itemDAO.rentalDailyPrice,
                        itemDAO.deposit,
                        conditionId,
                        itemDAO.description,
                        itemDAO.canBeDelivered,
                        itemDAO.deliveryStarting,
                        itemDAO.deliveryAdditional,
                        locationId,
                        userId
                    ],
                    result => result.id
                );
            }).catch(error => {
                throw new Error("Error when saving item: " + error);
            });
    };

    static save = (itemDAO) => {
        const eventualItemId = ItemRepository.saveItem(itemDAO);

        const saveCategoriesPromises = eventualItemId
            .then(itemId => {
                return this.saveCategories(itemDAO.categories, itemId);
            }).catch(error => {
                throw new Error("Error when creating item: " + error);
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
                "select id from public.category where name = $1",
                [category]
            ).then(categoryId => {
                return database.none(
                        `insert into public.itemToCategory (categoryId, itemId)
                         VALUES ($1, $2);`, [categoryId.id, itemId]);
            })
        }));
    };

    static getItemsForUser = (userEmail) => {
        return UserService.findOne({email: userEmail})
            .then(user => {
                return database.manyOrNone(
                        `select item.id,
                                item.title,
                                item.rentaldailyprice,
                                item.deposit,
                                condition.condition,
                                item.description,
                                item.canbedelivered,
                                item.deliverystarting,
                                item.deliveryadditional,
                                location.zipcode,
                                category.name AS categoryname,
                                item.image_url,
                                item.created_on
                         from item
                                  join condition on item.condition = condition.id
                                  join location on item.location = location.id
                                  join itemtocategory on itemtocategory.itemid = item.id
                                  join category on itemtocategory.categoryid = category.id
                         where item.owner = $1
                           and item.archived != true`,
                    [user.id]
                )
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
                                zipCode: itemEntity.zipcode
                            },
                            imageUrl: itemEntity.image_url
                        }))
                    }
                });
                return result;
            })
            .catch(error => {
                throw new Error("Error when retrieving items: " + error);
            });

    }
}