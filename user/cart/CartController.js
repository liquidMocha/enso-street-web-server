import express from "express";
import {addItemForUser, getCart} from "./CartRepository";

const router = express.Router();

router.get('/', async (req, res, next) => {
    const userEmail = req.session.email;
    if (userEmail) {
        try {
            const cart = await getCart(userEmail);
            res.status(200).json(cart);
        } catch (e) {
            console.error(`Error when retrieving cart for user ${userEmail}: ${e}`)
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
