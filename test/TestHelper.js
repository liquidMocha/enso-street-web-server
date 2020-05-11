import database from "../src/database.js";
import express from "express";
import app from "../src/app";
import {uuid} from "uuidv4";
import {save} from "../src/item/ItemRepository";
import {Item} from "../src/item/Item";
import ItemLocation from "../src/item/ItemLocation";
import Address from "../src/location/Address";
import {Coordinates} from "../src/location/Coordinates";
import {Owner} from "../src/item/Owner";

export async function setupItem({itemId = uuid(), userId, categories = ["novelty-electronics"], userEmail = "some@email.com"}) {
    await setupCategories(categories);
    const savedUserId = await setupUser({id: userId, email: userEmail})
    const item = new Item(
        {
            id: itemId,
            title: "test item",
            description: "non descriptive description",
            categories: categories,
            imageUrl: "some.url.com",
            rentalDailyPrice: 5,
            deposit: 10,
            condition: 'like-new',
            canBeDelivered: true,
            deliveryStarting: 1,
            deliveryAdditional: 2,
            location: new ItemLocation(new Address({
                street: "enso street",
                city: "Chicago",
                state: "IL",
                zipCode: "64521"
            }), new Coordinates(20, 30)),
            owner: new Owner(savedUserId, userEmail),
            searchable: true,
            archived: false,
            createdOn: new Date()
        });
    await save(item);

    return item;
}

export async function setupUser(
    {id: id, email: email, password: password, name: name = "some name", failedLoginAttempts: failedLoginAttempts = 0}
) {
    const createdUser = await database.one(`
                INSERT INTO public.user(id, email, password, failed_login_attempts)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (email) DO UPDATE
                    SET password=$2
                RETURNING id`,
        [id || uuid(), email, password, failedLoginAttempts]
    );

    await database.none(`
                insert into public.user_profile(id, name, user_id)
                values ($1, $2, $3)`,
        [uuid(), name, createdUser.id]
    );

    return createdUser.id;
}

export async function setupCategories(categories) {
    const values = categories.forEach(category => {
        database.none(`INSERT INTO public.category (name)
                       VALUES ($1)
                       ON CONFLICT DO NOTHING`, [category])
    });
}

export function getAuthenticatedApp(loggedInUserId) {
    const testApp = express();
    const userId = loggedInUserId || 'some-user-id';

    testApp.use((req, res, next) => {
        req.session = {userId: userId};
        next();
    });

    testApp.use(app);
    return testApp;
}
