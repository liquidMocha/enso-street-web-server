import {OrderItem} from "./OrderItem";
import Address from "../location/Address";
import {geocode, routeDistanceInMiles} from "../location/HereApiClient";
import {Item} from "../item/Item";
import {paymentIntent} from "../stripe/StripeClient";
import Stripe from 'stripe';

export async function createPaymentIntent(orderItems: OrderItem[], rentalDays: number, needsDelivery: boolean, deliveryAddress: Address): Promise<Stripe.PaymentIntent> {
    let deliveryFee = Promise.resolve(0);
    if (needsDelivery) {
        deliveryFee = calculateDeliveryFee(orderItems.map(itemWithQuantity => itemWithQuantity.item), deliveryAddress);
    }

    const itemSubtotal = orderItems.map(itemWithQuantity => {
        return itemWithQuantity.item.getRentalFee(rentalDays, itemWithQuantity.quantity);
    }).reduce((aggregate, itemRental) => {
        return aggregate + itemRental;
    }, 0);

    const amount = itemSubtotal + (await deliveryFee);

    return paymentIntent(amount);
}

export async function calculateDeliveryFee(items: Item[], deliveryAddress: Address) {
    const deliveryCoordinates = geocode(deliveryAddress);
    const deliveryFees = items.map(async item => {
        const distance = routeDistanceInMiles(item.coordinates, (await deliveryCoordinates));
        return item.getDeliveryFee(await distance);
    });

    return Math.max(...(await Promise.all(deliveryFees)));
}
