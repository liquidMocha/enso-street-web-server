import express, {NextFunction, Request, Response} from "express";
import {getItemByIds} from "../item/ItemRepository";
import {geocode, routeDistanceInMiles} from "../location/HereApiClient";
import Address from "../location/Address";

const router = express.Router();

async function getDeliveryQuote(req: Request, res: Response, next: NextFunction) {
    const itemIds = req.body.itemIds;
    const deliveryAddress = req.body.deliveryAddress;

    const deliveryCoordinates = geocode(new Address({
        street: deliveryAddress.street,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        zipCode: deliveryAddress.zipCode
    }));

    const items = getItemByIds(itemIds);

    const deliveryFees = (await items).map(async item => {
        const distance = routeDistanceInMiles(item.coordinates, (await deliveryCoordinates));
        return item.getDeliveryFee(await distance);
    });

    const deliveryFee = Math.max(...(await Promise.all(deliveryFees)))

    res.status(200).json(deliveryFee);
}

router.post('/delivery-quote', getDeliveryQuote)

export default router;
