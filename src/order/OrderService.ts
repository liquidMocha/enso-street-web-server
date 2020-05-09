import {Order} from "./Order";
import {getByPaymentIntentId, save} from "./OrderRepository";
import {uuid} from "uuidv4";
import {OrderLineItem} from "../transaction/OrderLineItem";
import {getItemById} from "../item/ItemRepository";
import Address from "../location/Address";
import {geocode} from "../location/HereApiClient";
import {getDeliveryFee} from "../transaction/TransactionService";

export async function initiateOrder(
    {deliveryAddress, orderLineItems, startTime, returnTime, userId}: {
        deliveryAddress?: Address,
        orderLineItems: OrderLineItem[],
        startTime: Date,
        returnTime: Date,
        userId: string
    }
): Promise<string> {
    let deliveryCoordinates;
    let deliveryFee = Promise.resolve(0);
    if (deliveryAddress !== undefined) {
        deliveryFee = getDeliveryFee(orderLineItems.map(lineItem => lineItem.orderItem), deliveryAddress);
        deliveryCoordinates = geocode(deliveryAddress);
    }

    const owner = (await getItemById(orderLineItems[0].orderItem.itemId)).owner
    const order = new Order({
        id: uuid(),
        orderItems: orderLineItems,
        startTime: startTime,
        returnTime: returnTime,
        executor: owner,
        deliveryCoordinates: await deliveryCoordinates,
        deliveryAddress,
        deliveryFee: await deliveryFee
    });

    await save(order);

    return order.id;
}

export function getOrderByPaymentIntent(paymentIntentId: string): Promise<Order> {
    return getByPaymentIntentId(paymentIntentId);
}
