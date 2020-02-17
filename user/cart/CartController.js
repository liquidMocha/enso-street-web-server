import express from "express";
import {addItemForUser, getItemsInCart} from "./CartRepository";
import ItemRepository from "../../item/ItemRepository";
import _ from "lodash";
import UserRepository from "../UserRepository";

const router = express.Router();

router.get('/', async (req, res, next) => {
    const userEmail = req.session.email;
    if (userEmail) {
        try {
            const itemIds = await getItemsInCart(userEmail);
            const itemDAOs = await Promise.all(itemIds.map(item => {
                return ItemRepository.getItemById(item.itemId)
            }));
            const ownerBatches = _.groupBy(itemDAOs, 'ownerEmail');

            const cartDTO = await Promise.all(
                Object.entries(ownerBatches).map(toCartDTO)
            );

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

async function toCartDTO([email, itemDAOs]) {
    const userName = (await UserRepository.findOne({email: email})).profile.name;

    return {
        owner: {
            name: userName,
            email: email
        },
        items: itemDAOs.map(dao => {
            return {
                id: dao.id,
                title: dao.title,
                rentalDailyPrice: dao.rentalDailyPrice,
                imageUrl: dao.imageUrl
            }
        })
    }
}

export default router;
