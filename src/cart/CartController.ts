import express, {NextFunction, Request, Response} from "express";
import {
    addItemToCartForUser,
    getCartForUser,
    getCartItemCountFor,
    removeAllInstanceOfItemFromCart,
    removeSingleItemFromCart
} from "./CartService";
import {requireAuthentication} from "../user/AuthenticationCheck";
import {getItemsOfOwnerInCartFor} from "./CartRepository";

const router = express.Router();

router.get('/count', requireAuthentication, getCartItemCount);
router.get('/', requireAuthentication, getCart);
router.put('/', requireAuthentication, addItemToCart);
router.delete('/', requireAuthentication, deleteItemFromCart);
router.get('/:ownerId/items', requireAuthentication, getOwnerItems);

async function getOwnerItems(req: Request, res: Response) {
    const renterId = req.session?.userId;
    const ownerId = req.params.ownerId;

    res.status(200).json(await getItemsOfOwnerInCartFor(renterId, ownerId));
}

async function getCartItemCount(req: Request, res: Response) {
    const userId = req.session?.userId;

    try {
        res.status(200).json(await getCartItemCountFor(userId));
    } catch (e) {
        console.error(`Error when retrieving cart for user ${userId}: ${e}`);
        res.status(500).send();
    }
}

async function getCart(req: Request, res: Response, next: NextFunction) {
    const userId = req.session?.userId;
    try {
        const cartDTO = await getCartForUser(userId);
        res.status(200).json(cartDTO);
    } catch (e) {
        console.error(`Error when retrieving cart for user ${userId}: ${e}`);
        res.status(500).send();
    }
}

async function addItemToCart(req: Request, res: Response, next: NextFunction) {
    const userId = req.session?.userId;
    const itemId = req.body.itemId;

    try {
        const updatedCart = await addItemToCartForUser(userId, itemId);
        res.status(200).json(updatedCart).send();
    } catch (e) {
        console.error(`Error when adding item to cart for user ${userId}: ${e}`);
        res.status(500).send();
    }
}

async function deleteItemFromCart(req: Request, res: Response, next: NextFunction) {
    const userId = req.session?.userId;
    const itemId = req.body.itemId;
    const deleteAll = req.body.all;

    try {
        let updatedCart;
        if (deleteAll) {
            updatedCart = await removeAllInstanceOfItemFromCart(userId, itemId);
        } else {
            updatedCart = await removeSingleItemFromCart(userId, itemId);
        }
        res.status(200).json(updatedCart).send();
    } catch (e) {
        console.error(`Error when removing item from cart for user ${userId}: ${e}`);
        res.status(500).send();
    }
}

export default router;
