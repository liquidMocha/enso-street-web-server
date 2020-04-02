import express from "express";
import {
    addItemToCartForUser,
    getCartForUser,
    removeAllInstanceOfItemFromCart,
    removeSingleItemFromCart
} from "./CartService";

const router = express.Router();

router.get('/', async (req, res, next) => {
    const userEmail = req.session.email;
    if (userEmail) {
        try {
            const cartDTO = await getCartForUser(userEmail);
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
    const itemId = req.body.itemId;

    try {
        if (userEmail) {
            await addItemToCartForUser(userEmail, itemId);
            res.status(200).send();
        } else {
            res.status(401).send();
        }
    } catch (e) {
        console.error(`Error when adding item to cart for user ${userEmail}: ${e}`);
        res.status(500).send();
    }
});

router.delete('/', async (req, res, next) => {
    const userEmail = req.session.email;
    const itemId = req.body.itemId;
    const deleteAll = req.query.all;

    try {
        if (userEmail) {
            if (deleteAll) {
                await removeAllInstanceOfItemFromCart(userEmail, itemId);
            } else {
                await removeSingleItemFromCart(userEmail, itemId);
            }
            res.status(200).send();
        } else {
            res.status(401).send();
        }
    } catch (e) {
        console.error(`Error when removing item from cart for user ${userEmail}: ${e}`);
        res.status(500).send();
    }
});

export default router;
