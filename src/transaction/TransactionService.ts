import {OrderItem} from "./OrderItem";
import {createPaymentIntentOf} from "../stripe/StripeClient";
import Stripe from 'stripe';
import {getItemById} from "../item/ItemRepository";
import {Order} from "../order/Order";
import Address from "../location/Address";
import {geocode, routeDistanceInMiles} from "../location/HereApiClient";
import {sameProcessOrderRepository} from "../ApplicationContext";

const orderRepository = sameProcessOrderRepository;

export async function createPaymentIntentFor(order: Order): Promise<Stripe.PaymentIntent> {
    const paymentIntent = await createPaymentIntentOf(order.charge);
    order.paymentIntentId = paymentIntent.id;
    await orderRepository.update(order);

    return paymentIntent;
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

export async function getDeliveryFee(items: OrderItem[], deliveryAddress: Address): Promise<number> {
    const deliveryCoordinates = geocode(deliveryAddress);
    const deliveryFees = items.map(async item => {
        const distance = routeDistanceInMiles(item.coordinates, (await deliveryCoordinates));
        return item.getDeliveryFee(await distance);
    });

    return Math.max(...(await Promise.all(deliveryFees)));
}
