import express from "express";
import HereApiClient from "../location/HereApiClient";
import Index from "./Index";
import {getItemByIds} from "../item/ItemRepository";

const router = express.Router();

async function search(searchTerm, coordinates) {
    const searchHits = await Index.searchByLocation(searchTerm, coordinates);
    const ids = searchHits.map(searchHit => {
        return searchHit.objectID
    });

    if (ids.length === 0) {
        return [];
    }
    return (await getItemByIds(ids)).map(item => {
        return {
            id: item.id,
            city: item.city,
            imageUrl: item.image_url,
            title: item.title,
            dailyRentalPrice: item.rentaldailyprice,
            zipCode: item.zipcode
        }
    });
}

router.post('/', async (req, res, next) => {
    const searchTerm = req.body.searchTerm;
    const coordinates = req.body.coordinates;

    if (!coordinates) {
        const address = req.body.address;
        const coordinates = await HereApiClient.geocode(address);

        const hitItems = await search(searchTerm, coordinates);
        res.status(200).json(hitItems);
    } else {
        const hitItems = await search(searchTerm, coordinates);
        res.status(200).json(hitItems);
    }
});

export default router;
