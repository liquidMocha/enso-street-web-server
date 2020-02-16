import express from "express";
import {addItemForUser, getCart} from "./CartRepository";
import ItemRepository from "../../item/ItemRepository";
import _ from "lodash";

const router = express.Router();

router.get('/', async (req, res, next) => {
    const userEmail = req.session.email;
    if (userEmail) {
        try {
            const itemIds = await getCart(userEmail);
            const itemDAOs = await Promise.all(itemIds.map(item => {
                return ItemRepository.getItemById(item.itemId)
            }));
            const ownerBatches = _.groupBy(itemDAOs, 'ownerEmail');
            const cartDTO = _.mapValues(ownerBatches, (daos) => {
                return daos.map(dao => {
                    return {
                        id: dao.id,
                        title: dao.title,
                        rentalDailyPrice: dao.rentalDailyPrice,
                        imageUrl: dao.imageUrl
                    }
                });
            });
            res.status(200).json(cartDTO);
        } catch (e) {
            console.error(`Error when retrieving cart for user ${userEmail}: ${e}`);
            res.status(500).send();
        }
    } else {
        res.status(401).send();
    }
});

router.put('/', async (req, res, next) => {
    const userEmail = req.session.email;
    if (userEmail) {
        await addItemForUser(req.body, userEmail);
        res.status(200).send();
    } else {
        res.status(401).send();
    }
});

export default router;
