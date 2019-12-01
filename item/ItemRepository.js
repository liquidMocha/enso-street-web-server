import database from '../database';
import {createLocation} from "../location/LocationRepository";
import UserService from "../user/UserService";
import ItemDTO from "./ItemDTO";
import * as aws from "aws-sdk";

export default class ItemRepository {
    static getConditionId = (condition) => {
        return database.one("select id " +
            "from public.condition " +
            "where condition = $1",
            [condition],
            result => result.id
        );
    };

    static saveItem = (itemDAO) => {
        const conditionId = ItemRepository.getConditionId(itemDAO.condition);

        const ownerUserId = UserService.findOne({email: itemDAO.ownerEmail});
        const locationId = itemDAO.location.id || ownerUserId
            .then(user => {
                return createLocation(itemDAO.location, user.id);
            });

        return Promise.all([conditionId, ownerUserId, locationId])
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
            });
    };

    static save = (itemDAO) => {
        const conditionId = ItemRepository.getConditionId(itemDAO.condition);

        const ownerUserId = UserService.findOne({email: itemDAO.ownerEmail});
        const locationId = itemDAO.location.id || ownerUserId
            .then(user => {
                return createLocation(itemDAO.location, user.id);
            });


        const eventualItemId = ItemRepository.saveItem(itemDAO);

        const saveCategoriesPromises = eventualItemId.then(itemId => {
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
        }).catch(error => {
            console.log("Error when saving item: ", error);
            throw new Error("Error when creating item");
        });

        const S3_BUCKET = process.env.Bucket;
        const s3 = new aws.S3({
            signatureVersion: 'v4'
        });
        const signedRequestPromise = eventualItemId.then(itemId => {
            const s3Params = {
                Bucket: S3_BUCKET,
                Key: itemId,
                Expires: 500,
                ACL: 'public-read'
            };

            return s3.getSignedUrlPromise('putObject', s3Params);
        }).then(signedRequest => {
            return signedRequest;
        }).catch(error => {
            console.error(error);
        });

        return Promise.all([signedRequestPromise, saveCategoriesPromises])
            .then(values => {
                return values[0];
            })
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
                                category.name AS categoryname
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
                            location: {
                                zipCode: itemEntity.zipcode
                            }
                        }))
                    }
                });
                return result;
            })
            .catch(error => {
                console.log(error);
                throw new Error("Error when retrieving items");
            });

    }
}