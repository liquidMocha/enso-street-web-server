import express from "express";
import ItemDTO from "./ItemDTO";
import {ItemDAO} from "./ItemDAO";
import {getItemById, getItemsForUser} from "./ItemRepository";

const router = express.Router();

const buildItemDTO = (itemPayload, userEmail) => {
    return new ItemDTO(
        {
            title: itemPayload.title,
            imageUrl: itemPayload.imageUrl,
            rentalDailyPrice: itemPayload.rentalDailyPrice,
            deposit: itemPayload.deposit,
            condition: itemPayload.condition,
            categories: itemPayload.categories,
            description: itemPayload.description,
            canBeDelivered: itemPayload.canBeDelivered,
            deliveryStarting: itemPayload.deliveryStarting,
            deliveryAdditional: itemPayload.deliveryAdditional,
            location: itemPayload.location,
            userEmail: userEmail
        }
    );
};

router.post('/', async (req, res, next) => {
    const userEmail = req.session.email;
    if (userEmail) {
        const itemPayload = req.body;
        const itemDTO = buildItemDTO(itemPayload, req.session.email);
        const itemDAO = await ItemDAO.fromDTO(itemDTO);

        try {
            await itemDAO.save();
            res.status(201).send();
        } catch (e) {
            res.status(500).send();
            console.error(`Error when saving item for user ${userEmail}: ${e}`)
        }
    } else {
        res.status(401).send();
    }
});

router.get('/', async (req, res, next) => {
    const userEmail = req.session.email;
    if (userEmail) {
        try {
            const items = await getItemsForUser(userEmail);
            res.status(200).json(items);
        } catch (e) {
            res.status(500).send();
            console.error(`Error when retrieving item for user ${userEmail}: ${e}`)
        }
    } else {
        res.status(401).send();
    }
});

router.get('/:itemId', async (req, res, next) => {
    try {
        const item = await getItemById(req.params.itemId);
        res.status(200).json(item);
    } catch (e) {
        res.status(500).send();
    }
});

router.delete('/:itemId', (req, res, next) => {
    const params = req.params;
    const userEmail = req.session.email;
    if (userEmail) {
        getItemById(params.itemId)
            .then(itemDAO => {
                return itemDAO.archive(userEmail);
            }).then(() => {
            res.status(200).send();
        }).catch(error => {
            res.status(500).send();
            throw new Error("Error when deleting item: " + error);
        });
    } else {
        res.status(401).send();
    }
});

router.put('/:itemId', async (req, res, next) => {
    const itemId = req.params.itemId;
    const userEmail = req.session.email;

    if (userEmail) {
        try {
            const itemDAO = await getItemById(itemId);
            if (itemDAO.ownerEmail === userEmail) {
                await itemDAO.update(req.body);
                res.status(200).send();
            } else {
                res.status(401).send();
            }
        } catch (error) {
            console.error(`Error when updating item ${itemId}: ${error}`);
            res.status(500).send();
        }
    } else {
        res.status(401).send();
    }
});

export default router;
