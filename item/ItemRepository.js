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

        const signedRequestPromise = this.getSignedS3Request(eventualItemId);

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

    static getSignedS3Request(eventualItemId) {
        const S3_BUCKET = process.env.Bucket;
        const s3 = new aws.S3({
            signatureVersion: 'v4'
        });

        return eventualItemId.then(itemId => {
            const imageUrl = `https://${S3_BUCKET}.s3.amazonaws.com/${itemId}`;
            return database.none(`update item
                                  set image_url = $1
                                  where item.id = $2;`,
                [imageUrl, itemId]);
        }).then(() => {
            const s3Params = {
                Bucket: S3_BUCKET,
                Key: itemId,
                Expires: 500,
                ACL: 'public-read',
                ContentType: 'image/jpeg'
            };
            return s3.getSignedUrlPromise('putObject', s3Params);
        }).then(signedRequest => {
            return signedRequest;
        }).catch(error => {
            console.error('Error when creating image upload link: ' + error);
        });
    }

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
                                category.name AS categoryname,
                                item.image_url
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