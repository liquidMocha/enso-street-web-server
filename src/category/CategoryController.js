import express from "express";
import {getAllCategories, getItemCountForCategory} from "./CategoryRepository";

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const categories = await getAllCategories();
        res.status(200).json(categories);
    } catch (e) {
        res.status(500).send();
        console.error("Error when fetching all categories: " + e);
    }
});

router.get('/:category/count', async (req, res, next) => {
    const itemCountForCategory =
        getItemCountForCategory(req.params.category);

    res.status(200).json(await itemCountForCategory);
});

export default router;
