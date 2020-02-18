import express from "express";
import {getAllCategories, getItemCountForCategory} from "./CategoryRepository";

const router = express.Router();

router.get('/', (req, res, next) => {
    getAllCategories()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(error => {
            res.status(500).send();
            console.error("Error when fetching all categories: " + error);
        });
});

router.get('/:category/count', async (req, res, next) => {
    const itemCountForCategory =
        getItemCountForCategory(req.params.category);

    res.status(200).json(await itemCountForCategory);
});

export default router;
