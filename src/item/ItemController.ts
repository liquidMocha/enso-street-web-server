import express from "express";
import ItemDTO from "./ItemDTO";
import {getItemById, getItemsForUser, save, update} from "./ItemRepository";
import {Item} from "./Item";
import {Category} from "../category/Category";
import {Condition} from "./Condition";
import ItemLocationDTO from "../location/ItemLocationDTO";
import {geocode} from "../location/HereApiClient";
import BorrowerItem from "./BorrowerItem";
import UpdateItem from "./UpdateItem";
import ItemLocation from "./ItemLocation";
import Address from "../location/Address";

const router = express.Router();

const mapToItemDTO = async (itemPayload: any, userEmail: string): Promise<ItemDTO> => {
    return new ItemDTO(
        itemPayload.id,
        itemPayload.title,
        itemPayload.rentalDailyPrice,
        itemPayload.deposit,
        itemPayload.condition,
        itemPayload.categories,
        itemPayload.description,
        itemPayload.canBeDelivered,
        itemPayload.deliveryStarting,
        itemPayload.deliveryAdditional,
        new ItemLocationDTO(
            itemPayload.location.address.street,
            itemPayload.location.address.city,
            itemPayload.location.address.state,
            itemPayload.location.address.zipCode,
            await geocode(
                new Address(
                    {
                        street: itemPayload.location.address.street,
                        city: itemPayload.location.address.city,
                        state: itemPayload.location.address.state,
                        zipCode: itemPayload.location.address.zipCode
                    }
                )
            )
        ),
        userEmail,
        itemPayload.imageUrl,
        itemPayload.searchable,
        itemPayload.archived,
        itemPayload.createdOn || new Date()
    );
};

const mapToItem = (itemDTO: ItemDTO): Item => {
    return new Item(
        {
            id: itemDTO.id,
            title: itemDTO.title,
            description: itemDTO.description,
            categories: itemDTO.categories.map(category => {
                return <Category>category
            }),
            imageUrl: itemDTO.imageUrl,
            rentalDailyPrice: itemDTO.rentalDailyPrice,
            deposit: itemDTO.deposit,
            condition: <Condition>itemDTO.condition,
            canBeDelivered: itemDTO.canBeDelivered,
            deliveryStarting: itemDTO.deliveryStarting,
            deliveryAdditional: itemDTO.deliveryAdditional,
            location: new ItemLocation(
                itemDTO.location.address,
                itemDTO.location.coordinates
            ),
            ownerEmail: itemDTO.userEmail,
            searchable: itemDTO.searchable,
            archived: itemDTO.archived,
            createdOn: itemDTO.createdOn
        }
    )
}

const mapToUpdateItem = async (updateItemPayload: any): Promise<UpdateItem> => {
    const coordinates = geocode(new Address(
        {
            street: updateItemPayload.location.address.street,
            city: updateItemPayload.location.address.city,
            state: updateItemPayload.location.address.state,
            zipCode: updateItemPayload.location.address.zipCode
        },
    ));

    return new UpdateItem(
        updateItemPayload.title,
        updateItemPayload.description,
        updateItemPayload.categories,
        updateItemPayload.imageUrl,
        updateItemPayload.rentalDailyPrice,
        updateItemPayload.deposit,
        updateItemPayload.condition,
        updateItemPayload.canBeDelivered,
        updateItemPayload.deliveryStarting,
        updateItemPayload.deliveryAdditional,
        new ItemLocationDTO(
            updateItemPayload.location.address.street,
            updateItemPayload.location.address.city,
            updateItemPayload.location.address.state,
            updateItemPayload.location.address.zipCode,
            await coordinates
        ),
        updateItemPayload.searchable,
        updateItemPayload.archived
    )
}

router.post('/', async (req, res, next) => {
    const userEmail = req.session?.email;
    if (userEmail) {
        const itemPayload = req.body;
        const itemDTO = mapToItemDTO(itemPayload, userEmail);
        const item = mapToItem(await itemDTO);

        try {
            await save(await item);

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
    const userEmail = req.session?.email;
    if (userEmail) {
        try {
            const items = await getItemsForUser(userEmail);
            const unarchivedItems = items.filter(item => !item.archived)
            res.status(200).json(unarchivedItems);
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
        const borrowerItem = new BorrowerItem(
            {
                itemId: item.id,
                title: item.title,
                description: item.description,
                ownerEmail: item.ownerEmail,
                deposit: item.deposit,
                rentalDailyPrice: item.rentalDailyPrice,
                deliveryAdditional: item.deliveryAdditional,
                deliveryStarting: item.deliveryStarting,
                condition: item.condition,
                imageUrl: item.imageUrl,
                canBeDelivered: item.canBeDelivered,
                coordinates: item.location.coordinates,
                createdOn: item.createdOn
            }
        )

        res.status(200).json(borrowerItem);
    } catch (e) {
        res.status(500).send();
    }
});

router.delete('/:itemId', async (req, res, next) => {
    const params = req.params;
    const userEmail = req.session?.email;
    if (userEmail) {
        const items = await getItemsForUser(userEmail);
        const itemToBeDeleted = items.find(item => item.id === params.itemId)

        if (itemToBeDeleted) {
            itemToBeDeleted.archive();
            await update(itemToBeDeleted);

            res.status(200).send();
        } else {
            res.status(204).send();
        }
    } else {
        res.status(401).send();
    }
});

router.put('/:itemId', async (req, res, next) => {
    const itemId = req.params.itemId;
    const userEmail = req.session?.email;

    if (userEmail) {
        try {
            const items = await getItemsForUser(userEmail);
            const itemToBeEdited = items.find(item => item.id === itemId);
            const updatedItem = mapToUpdateItem(req.body);

            if (itemToBeEdited) {
                itemToBeEdited.update(await updatedItem);
                console.log('item to be edited: ', itemToBeEdited);
                await update(itemToBeEdited);

                res.status(200).send();
            } else {
                res.status(404).send();
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
