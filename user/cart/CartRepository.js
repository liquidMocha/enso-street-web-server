import database from "../../database";

export const addItemForUser = (itemId, renterId) => {
    return database.none(`INSERT INTO cart (renter, item, quantity)
                          VALUES ($1, $2, 1)
                          ON CONFLICT ON CONSTRAINT cart_pkey
                              DO UPDATE SET quantity = (excluded.quantity + 1)`,
        [renterId, itemId]);
};

export const getItemsInCart = async (renterId) => {
    return (await database.manyOrNone(`
        SELECT item, quantity
        FROM cart
        WHERE renter = $1`, [renterId])).map(data => {
        return {
            id: data.item,
            quantity: data.quantity
        }
    })
};
