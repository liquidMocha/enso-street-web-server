import express from "express";
import ItemDTO from "./ItemDTO";
import ItemDAO from "./ItemDAO";
import ItemRepository from "./ItemRepository";

const router = express.Router();

router.post('/', (req, res, next) => {
    if (req.session.email) {
        const itemPayload = req.body;
        const itemDTO = new ItemDTO(
            {
                title: itemPayload.title,
                rentalDailyPrice: itemPayload.rentalDailyPrice,
                deposit: itemPayload.deposit,
                condition: itemPayload.condition,
                categories: itemPayload.categories,
                description: itemPayload.description,
                canBeDelivered: itemPayload.canBeDelivered,
                deliveryStarting: itemPayload.deliveryStarting,
                deliveryAdditional: itemPayload.deliveryAdditional,
                location: itemPayload.location,
                userEmail: req.session.email
            }
        );

        const itemDAO = ItemDAO.fromDTO(itemDTO);

        itemDAO.save()
            .then((signedRequest) => {
                res.status(201).json(signedRequest);
            })
            .catch(() => {
                res.status(500).send();
            });
    } else {
        res.status(401).send();
    }
});

router.get('/', (req, res, next) => {
    const userEmail = req.session.email;
    if (userEmail) {
        ItemRepository.getItemsForUser(userEmail)
            .then(items => {
                res.status(200).json(items);
            });
    } else {
        res.status(401).send();
    }
});

router.delete('/:itemId', (req, res, next) => {
    const params = req.params;

    if (req.session.email) {
        ItemRepository.getItemById(params.itemId).then(itemDAO => {
            return itemDAO.archive(req.session.email);
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

router.put('/:itemId', (req, res, next) => {
    const itemId = req.params.itemId;
    const userEmail = req.session.email;

    if (userEmail) {
        ItemRepository.getItemById(itemId)
            .then(itemDAO => {
                if (itemDAO.ownerEmail === userEmail) {
                    return itemDAO.update(req.body);
                } else {
                    res.status(401).send();
                }
            })
            .then(() => {
                res.status(200).send();
            })
            .catch(error => {
                res.status(500).send();
                throw new Error(`Error when updating item: ${error}`)
            })
    } else {
        res.status(401).send();
    }
});

export default router;