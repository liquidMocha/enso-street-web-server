import express from "express";
import CategoryRepository from "./CategoryRepository";

const router = express.Router();

router.get('/', (req, res, next) => {
    CategoryRepository.getAllCategories()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(error => {
            res.status(500).send();
            console.error("Error when fetching all categories: " + error);
        });
});

export default router;