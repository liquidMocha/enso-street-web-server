import express, {NextFunction, Request, Response} from "express";
import {getItemById, getItemByIds} from "../item/ItemRepository";
import Address from "../location/Address";
import {requireAuthentication} from "../user/AuthenticationCheck";
import {CheckoutItemDTO} from "./CheckoutItemDTO";
import {OrderItem} from "./OrderItem";
import {calculateDeliveryFee, createPaymentIntent} from "./TransactionService";

const router = express.Router();

router.post('/delivery-quote', getDeliveryQuote)
router.post('/pay', requireAuthentication, getPaymentIntent)

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

async function getPaymentIntent(req: Request, res: Response, next: NextFunction) {
    const needsDelivery: boolean = req.body.needsDelivery;
    const rentalDays: number = req.body.rentalDays;
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

    res.status(200).json({clientSecret: paymentIntent.client_secret});
}

export default router;
