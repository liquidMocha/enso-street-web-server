import express from "express";
import ItemRepository from "../item/ItemRepository";
import HereApiClient from "../location/HereApiClient";
import {searchByLocation} from "./Index";

const router = express.Router();

const getItemsInRangeFrom = (coordinates) => {
    return ItemRepository.getItemsInRangeFrom({
        latitude: coordinates.latitude,
        longitude: coordinates.longitude
    }, process.env.SEARCH_RANGE_IN_MILES);
};

router.post('/', async (req, res, next) => {
    const searchTerm = req.body.searchTerm;
    const coordinates = req.body.coordinates;

    if (!coordinates) {
        const address = req.body.address;
        const coordinates = await HereApiClient.geocode(address);

        const searchResult = searchByLocation(searchTerm, coordinates);
        res.status(200).json(await searchResult);
    } else {
        const searchResult = searchByLocation(searchTerm, coordinates);
        res.status(200).json(await searchResult);
    }
});

export default router;