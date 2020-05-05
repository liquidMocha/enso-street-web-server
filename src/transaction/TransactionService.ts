import {OrderItem} from "./OrderItem";
import Address from "../location/Address";
import {geocode, routeDistanceInMiles} from "../location/HereApiClient";
import {paymentIntent} from "../stripe/StripeClient";
import Stripe from 'stripe';
import {OrderLineItem} from "./OrderLineItem";
import {getItemById} from "../item/ItemRepository";

export async function createPaymentIntent(orderLineItems: OrderLineItem[], rentalDays: number, needsDelivery: boolean, deliveryAddress: Address): Promise<Stripe.PaymentIntent> {
    let deliveryFee = Promise.resolve(0);
    if (needsDelivery) {
        deliveryFee = calculateDeliveryFee(orderLineItems.map(lineItem => lineItem.orderItem), deliveryAddress);
    }

    const itemSubtotal = orderLineItems
        .map(orderItem => orderItem.getRentalFee(rentalDays, orderItem.quantity))
        .reduce((aggregate, itemRental) => {
            return aggregate + itemRental;
        }, 0);

    const amount = itemSubtotal + (await deliveryFee);

    return paymentIntent(amount);
}

export async function calculateDeliveryFee(items: OrderItem[], deliveryAddress: Address) {
    const deliveryCoordinates = geocode(deliveryAddress);
    const deliveryFees = items.map(async item => {
        const distance = routeDistanceInMiles(item.coordinates, (await deliveryCoordinates));
        return item.getDeliveryFee(await distance);
    });

    return Math.max(...(await Promise.all(deliveryFees)));
}

export function snapshotItems(itemIds: string[]): Promise<OrderItem[]> {
    return Promise.all(
        itemIds.map(async (itemId: string) => snapshotItem(itemId))
    )
}

export async function snapshotItem(itemId: string): Promise<OrderItem> {
    const item = await getItemById(itemId);
    return new OrderItem(
        {
            itemId: item.id,
            title: item.title,
            description: item.description,
            imageUrl: item.imageUrl,
            rentalDailyPrice: item.rentalDailyPrice,
            deposit: item.deposit,
            condition: item.condition,
            canBeDelivered: item.canBeDelivered,
            deliveryStarting: item.deliveryStarting,
            deliveryAdditional: item.deliveryAdditional,
            location: item.location
        });

}
