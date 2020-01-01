import express from "express";
import ItemRepository from "../item/ItemRepository";

const router = express.Router();

router.post('/', (req, res, next) => {
    const searchTerm = req.body.searchTerm;
    const {latitude, longitude} = req.body.coordinates;

    ItemRepository.getItemsInRangeFrom({latitude, longitude}, 5)
        .then(result => {
            res.status(200).json(result);
        })
        .catch(error => {
            console.error(`Error when searching: ${error}`);
        });
});

export default router;