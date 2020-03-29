import express from "express";
import {addItemForUser} from "./CartRepository";
import UserRepository from "../UserRepository";
import {getCartForUser} from "./CartService";

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
    try {
        if (userEmail) {
            const userId = UserRepository.findOne({email: userEmail});
            await addItemForUser(req.body.itemId, (await userId).id);
            res.status(200).send();
        } else {
            res.status(401).send();
        }
    } catch (e) {
        console.error(`Error when adding item to cart for user ${userEmail}: ${e}`);
        res.status(500).send();
    }
});

export default router;
