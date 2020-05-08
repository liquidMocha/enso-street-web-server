import express, {NextFunction, Request, Response} from "express";
import {requireAuthentication} from "../user/AuthenticationCheck";
import {getOrderById, getReceivedOrders, update} from "./OrderRepository";
import {cancelPaymentIntent, capturePaymentIntent, refundDeposit} from "../stripe/StripeClient";

const router = express.Router();

router.get('/', requireAuthentication, getOrders);
router.post('/:orderId/cancel', requireAuthentication, cancelOrder);
router.post('/:orderId/confirm', requireAuthentication, confirmOrder)
router.post('/:orderId/complete', requireAuthentication, completeOrder)

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
        const order = await getOrderById(request.params.orderId, userId);
        order.cancel();
        await update(order);
        await cancelPaymentIntent(order.paymentIntentId);
    } catch (error) {
        response.status(400).send();
        next(error);
    }

    response.status(200).send();
}

async function confirmOrder(request: Request, response: Response, next: NextFunction) {
    const userId = request.session?.userId;

    try {
        const order = await getOrderById(request.params.orderId, userId);
        order.confirm();
        await update(order);
        await capturePaymentIntent(order.paymentIntentId);
        response.status(200).send();
    } catch (e) {
        response.status(400).send();
        next(e);
    }
}

async function completeOrder(request: Request, response: Response, next: NextFunction) {
    const userId = request.session?.userId;

    try {
        const order = await getOrderById(request.params.orderId, userId);
        order.complete();
        await update(order);
        await refundDeposit(order);
        response.status(200).send();
    } catch (e) {
        response.status(400).send();
        next(e);
    }
}

export default router;
