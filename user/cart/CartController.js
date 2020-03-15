import express from "express";
import {addItemForUser, getItemsInCart} from "./CartRepository";
import * as ItemRepository from "../../item/ItemRepository";
import _ from "lodash";
import UserRepository from "../UserRepository";

const router = express.Router();

router.get('/', async (req, res, next) => {
    const userEmail = req.session.email;
    if (userEmail) {
        try {
            const userId = (await UserRepository.findOne({email: userEmail})).id;
            const cartItems = await getItemsInCart(userId);
            const itemDAOs = await Promise.all(cartItems.map(async cartItem => {
                return {
                    ...(await ItemRepository.getItemById(cartItem.id)),
                    quantity: cartItem.quantity
                }
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
    try {
        if (userEmail) {
            const userId = UserRepository.findOne({email: userEmail});
            await addItemForUser(req.body, (await userId).id);
            res.status(200).send();
        } else {
            res.status(401).send();
        }
    } catch (e) {
        console.error(`Error when adding item to cart for user ${userEmail}: ${e}`);
        res.status(500).send();
    }
});

async function toCartDTO([email, itemDAOs]) {
    const userName = (await UserRepository.findOne({email: email})).profile.name;
    const items = itemDAOs.map(dao => {
        return {...(dao.toDTO()), quantity: dao.quantity};
    });

    return {
        owner: {
            name: userName,
            email: email
        },
        items: items
    }
}

export default router;
