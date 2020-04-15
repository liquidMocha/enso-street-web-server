import express from "express";
import {geocode} from "../location/HereApiClient";
import Index from "./Index";
import {getItemByIds} from "../item/ItemRepository";
import {Coordinates} from "../location/Coordinates";
import SearchResultItem from "../item/SearchResultItem";

const router = express.Router();

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

router.post('/', async (req, res, next) => {
    const searchTerm = req.body.searchTerm;
    const coordinates = req.body.coordinates;

    if (!coordinates) {
        const address = req.body.address;
        const coordinates = await geocode(address);

        const hitItems = await search(searchTerm, coordinates);
        res.status(200).json(hitItems);
    } else {
        const hitItems = await search(searchTerm, coordinates);
        res.status(200).json(hitItems);
    }
});

export default router;
