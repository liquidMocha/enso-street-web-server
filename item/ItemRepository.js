import database from '../database';
import {createLocation} from "../location/LocationRepository";
import UserService from "../user/UserService";
import ItemDTO from "./ItemDTO";

export default class ItemRepository {
    static save = (itemDAO) => {
        const conditionId = database.one("select id " +
            "from public.condition " +
            "where condition = $1",
            [itemDAO.condition],
            condition => condition.id
        );

        const userId = UserService.findOne({email: itemDAO.ownerEmail});
        const locationId = UserService.findOne({email: itemDAO.ownerEmail})
            .then(user => {
                if (itemDAO.location.id) {
                    return itemDAO.location.id;
                } else {
                    return createLocation(itemDAO.location, user.id);
                }
            });


        return Promise.all([conditionId, userId, locationId])
            .then((values) => {
                const conditionId = values[0];
                const userId = values[1].id;
                const locationId = values[2];
                return database.one(
                    "insert into public.item(" +
                    "title," +
                    "rentalDailyPrice," +
                    "deposit," +
                    "condition," +
                    "description," +
                    "canBeDelivered," +
                    "deliveryStarting," +
                    "deliveryAdditional," +
                    "location," +
                    "owner" +
                    " )" +
                    "values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) " +
                    "returning id",
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
            })
            .then(itemId => {
                return Promise.all(itemDAO.categories.map(category => {
                    database.one(
                        "select id from public.category where name = $1",
                        [category]
                    ).then(categoryId => {
                        return database.none(
                            "insert into public.itemToCategory (categoryId, itemId) " +
                            "VALUES ($1, $2);", [categoryId.id, itemId]);
                    })
                }));
            })
            .catch(error => {
                console.log("Error when saving item: ", error);
                throw new Error("Error when creating item");
            });
    };

    static getItemsForUser = (userEmail) => {
        return UserService.findOne({email: userEmail})
            .then(user => {
                return database.many(
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
                                category.name
                         from item
                                  join condition on item.condition = condition.id
                                  join location on item.location = location.id
                                  join itemtocategory on itemtocategory.itemid = item.id
                                  join category on itemtocategory.categoryid = category.id
                         where item.owner = $1`,
                    [user.id]
                )
            })
            .then((entities) => {
                return entities.map(itemEntity => {
                    return new ItemDTO({
                        id: itemEntity.id,
                        title: itemEntity.title,
                        rentalDailyPrice: itemEntity.rentaldailyprice,
                        deposit: itemEntity.deposit,
                        condition: itemEntity.condition,
                        description: itemEntity.description,
                        canBeDelivered: itemEntity.canbedelivered,
                        deliveryStarting: itemEntity.deliverystarting,
                        deliveryAdditional: itemEntity.deliveryadditional,
                        location: {
                            zipCode: itemEntity.zipcode
                        }
                    })
                });
            })
            .catch(error => {
                console.log(error);
                throw new Error("Error when retrieving items");
            });

    }
}