import express, {Request, Response} from "express";
import {geocode} from "../location/HereApiClient";
import Index from "./Index";
import {getItemByIds} from "../item/ItemRepository";
import {Coordinates} from "../location/Coordinates";
import SearchResultItem from "../item/SearchResultItem";

const router = express.Router();

router.post('/', searchEndpoint);

async function searchEndpoint(req: Request, res: Response) {
    const searchTerm = req.body.searchTerm;
    const coordinates = req.body.coordinates;

    if (!coordinates) {
        const address = req.body.address;
        const navigationCoordinates = await geocode(address);

        const hitItems = await search(searchTerm, navigationCoordinates);
        res.status(200).json(hitItems);
    } else {
        const hitItems = await search(searchTerm, coordinates);
        res.status(200).json(hitItems);
    }
}

async function search(searchTerm: string, coordinates: Coordinates) {
    const searchHits = await Index.searchByLocation(searchTerm, coordinates);
    const ids = searchHits.map(searchHit => {
        return searchHit.objectID
    });

    const items = await getItemByIds(ids);
    return items.map(item => new SearchResultItem(
        {
            id: item.id,
            city: item.location.address.city,
            imageUrl: item.imageUrl,
            title: item.title,
            dailyRentalPrice: item.rentalDailyPrice,
            zipCode: item.location.address.zipCode
        }
    ))
}

export default router;
