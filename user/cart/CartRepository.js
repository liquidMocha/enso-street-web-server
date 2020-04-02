import database from "../../database";
import {reconstitueFromDao} from "./CartFactory";

export const getCartItemsFor = async (renterId) => {
    const cartDao = (await database.manyOrNone(`
        SELECT item, quantity
        FROM cart
        WHERE renter = $1`, [renterId])).map(data => {
        return {
            id: data.item,
            quantity: data.quantity
        }
    });

    return reconstitueFromDao(cartDao);
};

export const update = async (renterId, cart) => {
    try {
        await database.tx(transaction => {
            const upsertCartItems = cart.items
                .filter(cartItem => cartItem.quantity !== 0)
                .map(cartItem => {
                    transaction.none(`
                        INSERT INTO cart (renter, item, quantity)
                        VALUES ($1, $2, $3)
                        ON CONFLICT ON CONSTRAINT cart_pkey
                            DO UPDATE SET quantity = $3
                    `, [renterId, cartItem.id, cartItem.quantity])
                });

            const deleteCartItems = cart.items
                .filter(cartItem => cartItem.quantity === 0)
                .map(cartItem => {
                    transaction.none(`
                        DELETE
                        FROM cart
                        WHERE renter = $1
                          and item = $2
                    `, [renterId, cartItem.id])
                });

            return transaction.batch(upsertCartItems.concat(deleteCartItems));
        });

        return await getCartItemsFor(renterId);
    } catch (e) {
        console.error(`Error when updating cart: ${e}`)
    }

};
