import database from "../database";

export async function setupUser({email: email, password: password, name: name}) {
    const data = await database.one(`
                insert into public.user(email, password)
                values ($1, $2)
                returning id`,
        [email, password]
    );

    if (name) {
        await database.none(`
                    insert into public.user_profile(name, user_id)
                    values ($1, $2)`,
            [name, data.id]
        );
    }
}