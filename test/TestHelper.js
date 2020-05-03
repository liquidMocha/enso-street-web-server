import database from "../src/database.js";
import express from "express";
import app from "../src/app";
import {uuid} from "uuidv4";
import {save} from "../src/item/ItemRepository";
import {Item} from "../src/item/Item";
import ItemLocation from "../src/item/ItemLocation";
import Address from "../src/location/Address";
import {Coordinates} from "../src/location/Coordinates";

export async function setupItem(itemId) {
    const userEmail = "some@email.com";
    await setupUser({id: uuid(), email: userEmail})
    return save(new Item(
        {
            id: itemId,
            title: "test item",
            description: "non descriptive description",
            categories: "novelty-electronics",
            imageUrl: "some.url.com",
            rentalDailyPrice: 5,
            deposit: 10,
            condition: 'like-new',
            canBeDelivered: true,
            deliveryStarting: 1,
            deliveryAdditional: 2,
            location: new ItemLocation(new Address({
                street: "",
                city: "",
                state: "",
                zipCode: ""
            }), new Coordinates(20, 30)),
            ownerEmail: userEmail,
            searchable: true,
            archived: false,
            createdOn: new Date()
        }));
}

export async function setupUser(
    {id: id, email: email, password: password, name: name = "", failedLoginAttempts: failedLoginAttempts = 0}
) {
    const createdUser = await database.one(`
                INSERT INTO public.user(id, email, password, failed_login_attempts)
                VALUES ($1, $2, $3, $4)
                ON CONFLICT (email) DO UPDATE
                    SET password=$2
                RETURNING id`,
        [id || uuid(), email, password, failedLoginAttempts]
    );

    if (name) {
        await database.none(`
                    insert into public.user_profile(id, name, user_id)
                    values ($1, $2, $3)`,
            [uuid(), name, createdUser.id]
        );
    }

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
