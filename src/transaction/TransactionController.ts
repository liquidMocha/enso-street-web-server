import express, {NextFunction, Request, Response} from "express";
import Address from "../location/Address";
import {requireAuthentication} from "../user/AuthenticationCheck";
import {CheckoutItemDTO} from "./CheckoutItemDTO";
import {createPaymentIntentFor, getDeliveryFee, snapshotItem, snapshotItems} from "./TransactionService";
import {StripeEvent} from "../stripe/StripeEvent";
import {getOrderByPaymentIntent, initiateOrder} from "../order/OrderService";
import {OrderLineItem} from "./OrderLineItem";
import {sameProcessOrderRepository, sameProcessUserAdaptor} from "../ApplicationContext";

const orderRepository = sameProcessOrderRepository;
const userAdaptor = sameProcessUserAdaptor;
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
    const renterUserId = req.session?.userId;

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
        userId: renterUserId
    }, userAdaptor);
    const order = await orderRepository.getOrderById(await orderId);
    const paymentIntent = await createPaymentIntentFor(order);

    res.status(200).json({clientSecret: paymentIntent.client_secret});
}

async function handleCustomerPaymentAuthorized(request: Request, response: Response, next: NextFunction) {
    let event;
    event = request.body;

    if (event.type !== StripeEvent.PAYMENT_AUTHORIZED) {
        console.error(`Webhook Error: not able to handle event type: ${event.type}`)
        response.status(200).send();
        return;
    } else {
        console.log('event data object: ', event.data.object);
        const order = await getOrderByPaymentIntent(event.data.object.id);
        order.authorizePayment();
        await orderRepository.update(order);
        response.status(200).send();
    }

    response.json({received: true});
}

export default router;
