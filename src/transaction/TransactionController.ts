import express, {NextFunction, Request, Response} from "express";
import {getItemById, getItemByIds} from "../item/ItemRepository";
import Address from "../location/Address";
import {requireAuthentication} from "../user/AuthenticationCheck";
import {CheckoutItemDTO} from "./CheckoutItemDTO";
import {OrderItem} from "./OrderItem";
import {calculateDeliveryFee, createPaymentIntent} from "./TransactionService";
import {StripeEvent} from "../stripe/StripeEvent";
import {createOrder, getOrderByPaymentIntent} from "../order/OrderService";
import {update} from "../order/OrderRepository";

const router = express.Router();

router.post('/delivery-quote', getDeliveryQuote)
router.post('/pay', requireAuthentication, getPaymentIntent)
router.post('/payment-authorized', customerPaymentAuthorized)

async function getDeliveryQuote(req: Request, res: Response, next: NextFunction) {
    const itemIds = req.body.itemIds;
    const deliveryAddressJson = req.body.deliveryAddress;

    const deliveryAddress = new Address({
        street: deliveryAddressJson.street,
        city: deliveryAddressJson.city,
        state: deliveryAddressJson.state,
        zipCode: deliveryAddressJson.zipCode
    });

    const items = getItemByIds(itemIds);

    const deliveryFee = await calculateDeliveryFee((await items), (await deliveryAddress));

    res.status(200).json(deliveryFee);
}

function calculateRentalDays(startDate: Date, endDate: Date) {
    return Math.floor(
        (
            Date.UTC(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())
            - Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
        )
        / (1000 * 60 * 60 * 24),
    ) + 1;
}

async function getPaymentIntent(req: Request, res: Response, next: NextFunction) {
    const needsDelivery: boolean = req.body.needsDelivery;
    const startTime: Date = new Date(req.body.rentDate);
    const returnTime: Date = new Date(req.body.returnDate);
    const rentalDays: number = calculateRentalDays(startTime, returnTime);

    const deliveryAddressJson = req.body.deliveryAddress;

    const deliveryAddress = new Address({
        street: deliveryAddressJson.street,
        city: deliveryAddressJson.city,
        state: deliveryAddressJson.state,
        zipCode: deliveryAddressJson.zipCode
    });
    const checkoutItems: CheckoutItemDTO[] = req.body.items
        .map((item: any) => new CheckoutItemDTO(item.id, item.quantity));

    const orderItems = await Promise.all(
        checkoutItems
            .map(async checkoutItem => new OrderItem(await getItemById(checkoutItem.id), checkoutItem.quantity))
    );

    const paymentIntent = await createPaymentIntent(orderItems, rentalDays, needsDelivery, deliveryAddress);
    await createOrder(paymentIntent.id, orderItems, startTime, returnTime);

    res.status(200).json({clientSecret: paymentIntent.client_secret});
}

async function customerPaymentAuthorized(request: Request, response: Response, next: NextFunction) {
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
