import database from "../database";
import {reconstitueFromDao} from "./CartFactory";
import {CartItemDao} from "./CartItemDao";

export const getCartItemsFor = async (renterId: string) => {
    const cartDao = (await database.manyOrNone(`
        SELECT item, quantity, owner
        FROM cart
                 JOIN item i on cart.item = i.id
        WHERE renter = $1`, [renterId])).map((data: any) => {
        return new CartItemDao(data.item, data.quantity, data.owner)
    });

    return reconstitueFromDao(cartDao);
};

export const update = async (renterId: string, cart: CartItemDao[]) => {
    try {
        await database.tx((transaction: any) => {
            const upsertCartItems = cart
                .filter(cartItem => cartItem.quantity !== 0)
                .map(cartItem => {
                    transaction.none(`
                        INSERT INTO cart (renter, item, quantity)
                        VALUES ($1, $2, $3)
                        ON CONFLICT ON CONSTRAINT cart_pkey
                            DO UPDATE SET quantity = $3
                    `, [renterId, cartItem.id, cartItem.quantity])
                });

            const deleteCartItems = cart
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
    } catch (e) {
        console.error(`Error when updating cart: ${e}`)
    }

};
