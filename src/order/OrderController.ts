import express, {NextFunction, Request, Response} from "express";
import {requireAuthentication} from "../user/AuthenticationCheck";
import {cancelPaymentIntent, capturePaymentIntent, payout, refundDeposit} from "../stripe/StripeClient";
import {sameProcessOrderRepository} from "../ApplicationContext";
import {Order} from "./Order";
import {OrderDto} from "./OrderDto";

const router = express.Router();
const orderRepository = sameProcessOrderRepository;

router.get('/', requireAuthentication, getOrders);
router.post('/:orderId/cancel', requireAuthentication, cancelOrder);
router.post('/:orderId/confirm', requireAuthentication, confirmOrder)
router.post('/:orderId/complete', requireAuthentication, completeOrder)

function orderToDto(order: Order): OrderDto {
    return {
        id: order.id,
        orderLineItems: order.orderLineItems,
        startTime: order.startTime,
        returnTime: order.returnTime,
        status: order.status,
        deliveryAddress: order.deliveryAddress,
        deliveryCoordinates: order.deliveryCoordinates,
        deliveryFee: order.deliveryFee,
        renter: order.renter,
    }
}

async function getOrders(request: Request, response: Response, next: NextFunction) {
    const userId = request.session?.userId;

    try {
        const orders = await orderRepository.getReceivedOrders(userId);
        const orderDtos = orders.map(order => orderToDto(order))
        response.json(orderDtos);
    } catch (error) {
        next(error);
    }
}

async function cancelOrder(request: Request, response: Response, next: NextFunction) {
    const userId = request.session?.userId;

    try {
        const order = await orderRepository.getOrderByIdForExecutor(request.params.orderId, userId);
        order.cancel();
        await orderRepository.update(order);
        if (order.paymentIntentId !== undefined) {
            await cancelPaymentIntent(order.paymentIntentId);
        } else {
            console.warn(`Cancelled order ${order.id} with null payment intent.`)
        }
    } catch (error) {
        response.status(400).send();
        next(error);
    }

    response.status(200).send();
}

async function confirmOrder(request: Request, response: Response, next: NextFunction) {
    const userId = request.session?.userId;

    try {
        const order = await orderRepository.getOrderByIdForExecutor(request.params.orderId, userId);
        order.confirm();
        await orderRepository.update(order);
        if (order.paymentIntentId !== undefined) {
            await capturePaymentIntent(order.paymentIntentId);
        } else {
            console.warn(`Confirmed order ${order.id} without payment intent.`)
        }
        response.status(200).send();
    } catch (e) {
        response.status(400).send();
        next(e);
    }
}

async function completeOrder(request: Request, response: Response, next: NextFunction) {
    const userId = request.session?.userId;

    try {
        const order = await orderRepository.getOrderByIdForExecutor(request.params.orderId, userId);
        order.complete();
        await orderRepository.update(order);
        await refundDeposit(order);
        await payout(order);
        response.status(200).send();
    } catch (e) {
        response.status(400).send();
        next(e);
    }
}

export default router;
