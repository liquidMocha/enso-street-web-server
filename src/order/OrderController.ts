import express, {NextFunction, Request, Response} from "express";
import {requireAuthentication} from "../user/AuthenticationCheck";
import {getOrderById, getReceivedOrders, update} from "./OrderRepository";
import {cancelPaymentIntent} from "../stripe/StripeClient";

const router = express.Router();

router.get('/', requireAuthentication, getOrders);
router.post('/:orderId/cancel', requireAuthentication, cancelOrder);

async function getOrders(request: Request, response: Response, next: NextFunction) {
    const userId = request.session?.userId;

    try {
        const orders = await getReceivedOrders(userId);
        response.json(orders);
    } catch (error) {
        next(error);
    }
}

async function cancelOrder(request: Request, response: Response, next: NextFunction) {
    const userId = request.session?.userId;

    try {
        const order = await getOrderById(request.params.orderId);
        order.cancel();
        await update(order);
        await cancelPaymentIntent(order.paymentIntentId);
    } catch (error) {
        next(error);
    }

    response.status(200);
}

export default router;
