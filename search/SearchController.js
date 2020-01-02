import express from "express";
import ItemRepository from "../item/ItemRepository";
import HereApiClient from "../location/HereApiClient";

const router = express.Router();

router.post('/', (req, res, next) => {
    const searchTerm = req.body.searchTerm;
    const coordinates = req.body.coordinates;
    if (!coordinates) {
        const address = req.body.address;

        HereApiClient.geocode(address)
            .then((coordinates) => {
                ItemRepository.getItemsInRangeFrom({
                    latitude: coordinates.latitude,
                    longitude: coordinates.longitude
                }, process.env.SEARCH_RANGE_IN_MILES)
                    .then(result => {
                        res.status(200).json(result);
                    })
                    .catch(error => {
                        console.error(`Error when searching: ${error}`);
                    });
            })
    } else {
        ItemRepository.getItemsInRangeFrom({
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
        }, process.env.SEARCH_RANGE_IN_MILES)
            .then(result => {
                res.status(200).json(result);
            })
            .catch(error => {
                console.error(`Error when searching: ${error}`);
            });
    }
});

export default router;