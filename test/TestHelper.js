import database from "../database";
import express from "express";
import app from "../app";

export async function setupUser({email: email, password: password, name: name}) {
    const data = await database.one(`
                INSERT INTO public.user(email, password)
                VALUES ($1, $2)
                ON CONFLICT (email) DO UPDATE
                    SET password=$2
                RETURNING id`,
        [email, password]
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

export function getAuthenticatedApp() {
    const testApp = express();
    const email = 'someemail';

    testApp.use((req, res, next) => {
        req.session = {email: email};
        next();
    });

    testApp.use(app);
    return testApp;
}
