import express, {NextFunction, Request, Response} from "express";
import Address from "../location/Address";
import {requireAuthentication} from "../user/AuthenticationCheck";
import {CheckoutItemDTO} from "./CheckoutItemDTO";
import {createPaymentIntentFor, getDeliveryFee, snapshotItem, snapshotItems} from "./TransactionService";
import {StripeEvent} from "../stripe/StripeEvent";
import {getOrderByPaymentIntent, initiateOrder} from "../order/OrderService";
import {getOrderById, update} from "../order/OrderRepository";
import {OrderLineItem} from "./OrderLineItem";

const router = express.Router();

router.post('/delivery-quote', getDeliveryQuote)
router.post('/pay', requireAuthentication, startTransaction)
router.post('/payment-authorized', handleCustomerPaymentAuthorized)

async function getDeliveryQuote(req: Request, res: Response, next: NextFunction) {
    const itemIds: string[] = req.body.itemIds;
    const deliveryAddressJson = req.body.deliveryAddress;

    const deliveryAddress = new Address({
        street: deliveryAddressJson.street,
        city: deliveryAddressJson.city,
        state: deliveryAddressJson.state,
        zipCode: deliveryAddressJson.zipCode
    });

    const orderItems = snapshotItems(itemIds);
    const deliveryFee = await getDeliveryFee(await orderItems, await deliveryAddress);

    res.status(200).json(deliveryFee);
}

async function startTransaction(req: Request, res: Response, next: NextFunction) {
    const startTime: Date = new Date(req.body.rentDate);
    const returnTime: Date = new Date(req.body.returnDate);
    const userId = req.session?.userId;

    const deliveryAddressJson = req.body.deliveryAddress;

    let deliveryAddress = undefined;
    if (deliveryAddressJson) {
        deliveryAddress = new Address({
            street: deliveryAddressJson.street,
            city: deliveryAddressJson.city,
            state: deliveryAddressJson.state,
            zipCode: deliveryAddressJson.zipCode
        });
    }
    const checkoutItems: CheckoutItemDTO[] = req.body.items
        .map((item: any) => new CheckoutItemDTO(item.id, item.quantity));

    const orderLineItems = await Promise.all(
        checkoutItems.map(async checkoutItem => {
            const orderItem = snapshotItem(checkoutItem.id);
            return new OrderLineItem(await orderItem, checkoutItem.quantity);
        })
    );

    const orderId = initiateOrder({
        deliveryAddress: deliveryAddress,
        orderLineItems: orderLineItems,
        startTime: startTime,
        returnTime: returnTime,
        userId: userId
    });
    const order = await getOrderById(await orderId);
    const paymentIntent = await createPaymentIntentFor(order);

    res.status(200).json({clientSecret: paymentIntent.client_secret});
}

async function handleCustomerPaymentAuthorized(request: Request, response: Response, next: NextFunction) {
    let event;
    event = request.body;

    if (event.type !== StripeEvent.PAYMENT_AUTHORIZED) {
        response.status(400).send(`Webhook Error: not able to handle event type: ${event.type}`);
        return;
    } else {
        console.log('event data object: ', event.data.object);
        const order = await getOrderByPaymentIntent(event.data.object.id);
        order.authorizePayment();
        await update(order);
    }

    response.json({received: true});
}

export default router;
