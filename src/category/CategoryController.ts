import express, {Request, Response} from "express";
import {getAllCategories, getItemCountForCategory} from "./CategoryRepository";

const router = express.Router();

router.get('/', allCategories);
router.get('/:category/count', itemCountForCategory);

async function allCategories(req: Request, res: Response) {
    try {
        const categories = await getAllCategories();
        res.status(200).json(categories);
    } catch (e) {
        res.status(500).send();
        console.error("Error when fetching all categories: " + e);
    }
}

async function itemCountForCategory(req: Request, res: Response) {
    const itemCountForCategory = getItemCountForCategory(req.params.category);
    res.status(200).json(await itemCountForCategory);
}

export default router;
