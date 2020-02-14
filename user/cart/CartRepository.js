import database from "../../database";

export const addItemForUser = (item, userEmail) => {
    return database.none(`UPDATE public."user"
                          SET cart = (cart::jsonb || $1::jsonb)
                          WHERE email = $2`, [item, userEmail])
};

export const getCart = async (email) => {
    return (await database.one(`SELECT cart
                                FROM public."user"
                                WHERE email = $1`, [email])).cart
};
