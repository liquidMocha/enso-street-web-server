import database from "../src/database.js";
import express from "express";
import app from "../src/app";
import {uuid} from "uuidv4";

export async function setupItem(itemId) {
    return database.none(`INSERT INTO item(id)
                          VALUES ($1)`, itemId);
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
