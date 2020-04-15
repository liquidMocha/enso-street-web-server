import express from "express";
import {
    addItemToCartForUser,
    getCartForUser,
    removeAllInstanceOfItemFromCart,
    removeSingleItemFromCart
} from "./CartService";

const router = express.Router();

router.get('/', async (req, res, next) => {
    const userId = req.session?.userId;
    if (userId) {
        try {
            const cartDTO = await getCartForUser(userId);
            res.status(200).json(cartDTO);
        } catch (e) {
            console.error(`Error when retrieving cart for user ${userId}: ${e}`);
            res.status(500).send();
        }
    } else {
        res.status(401).send();
    }
});

router.put('/', async (req, res, next) => {
    const userId = req.session?.userId;
    const itemId = req.body.itemId;

    try {
        if (userId) {
            const updatedCart = await addItemToCartForUser(userId, itemId);
            res.status(200).json(updatedCart).send();
        } else {
            res.status(401).send();
        }
    } catch (e) {
        console.error(`Error when adding item to cart for user ${userId}: ${e}`);
        res.status(500).send();
    }
});

router.delete('/', async (req, res, next) => {
    const userId = req.session?.userId;
    const itemId = req.body.itemId;
    const deleteAll = req.body.all;

    try {
        if (userId) {
            let updatedCart;
            if (deleteAll) {
                updatedCart = await removeAllInstanceOfItemFromCart(userId, itemId);
            } else {
                updatedCart = await removeSingleItemFromCart(userId, itemId);
            }
            res.status(200).json(updatedCart).send();
        } else {
            res.status(401).send();
        }
    } catch (e) {
        console.error(`Error when removing item from cart for user ${userId}: ${e}`);
        res.status(500).send();
    }
});

export default router;
