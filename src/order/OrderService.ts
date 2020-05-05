import {Order} from "./Order";
import {getByPaymentIntentId, save} from "./OrderRepository";
import {uuid} from "uuidv4";
import {OrderLineItem} from "../transaction/OrderLineItem";
import {getItemById} from "../item/ItemRepository";

export async function createOrder(
    paymentIntentId: string,
    orderItems: OrderLineItem[],
    startTime: Date,
    returnTime: Date
): Promise<void> {
    const owner = (await getItemById(orderItems[0].orderItem.itemId)).owner
    const order = new Order(uuid(), orderItems, paymentIntentId, startTime, returnTime, owner);

    return save(order);
}

export function getOrderByPaymentIntent(paymentIntentId: string): Promise<Order> {
    return getByPaymentIntentId(paymentIntentId);
}
