import database from "../database";
import express from "express";
import app from "../app";

export async function setupItem(itemId) {
    return database.none(`INSERT INTO item(id)
                          VALUES ($1)`, itemId);
}

export async function setupUser(
    {email: email, password: password, name: name = "", failedLoginAttempts: failedLoginAttempts = 0}
) {
    const data = await database.one(`
                INSERT INTO public.user(email, password, failed_login_attempts)
                VALUES ($1, $2, $3)
                ON CONFLICT (email) DO UPDATE
                    SET password=$2
                RETURNING id`,
        [email, password, failedLoginAttempts]
    );

    if (name) {
        await database.none(`
                    insert into public.user_profile(name, user_id)
                    values ($1, $2)`,
            [name, data.id]
        );
    }

    return data.id;
}

export async function setupCategories(categories) {
    const values = categories.forEach(category => {
        database.none(`INSERT INTO public.category (name)
                       VALUES ($1)
                       ON CONFLICT DO NOTHING`, [category])
    });
}

export function getAuthenticatedApp(loggedInUserEmail) {
    const testApp = express();
    const email = loggedInUserEmail || 'someemail';

    testApp.use((req, res, next) => {
        req.session = {email: email};
        next();
    });

    testApp.use(app);
    return testApp;
}
