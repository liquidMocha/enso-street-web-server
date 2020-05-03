import {OrderItem} from "../transaction/OrderItem";
import {Order} from "./Order";
import {getByPaymentIntentId, save} from "./OrderRepository";
import {uuid} from "uuidv4";

export function createOrder(
    paymentIntentId: string,
    orderItems: OrderItem[],
    startTime: Date,
    returnTime: Date
): Promise<void> {
    const order = new Order(uuid(), orderItems, paymentIntentId, startTime, returnTime);

    return save(order);
}

export function getOrderByPaymentIntent(paymentIntentId: string): Promise<Order> {
    return getByPaymentIntentId(paymentIntentId);
}
