import database from "../database";
import {reconstituteFromDao} from "./CartFactory";
import {CartItemDao} from "./CartItemDao";
import {prop} from "ramda";

export const getItemsOfOwnerInCartFor = async (ownerId: string, renterId: string) => {
    return (await database.manyOrNone(`
                SELECT item
                FROM cart
                         JOIN item i on cart.item = i.id
                WHERE renter = $1
                  AND owner = $2`,
        [renterId, ownerId])).map(prop('item'));
}

export const getCartItemsQuantitiesFor = async (renterId: string): Promise<number[]> => {
    return (await database.manyOrNone(`
        SELECT quantity
        FROM cart
        WHERE renter = $1`, [renterId])).map<number>(prop('quantity'));
}

export const getCartItemsFor = async (renterId: string) => {
    const cartDao = (await database.manyOrNone(`
        SELECT item, quantity, owner
        FROM cart
                 JOIN item i on cart.item = i.id
        WHERE renter = $1`, [renterId])).map((data: any) => {
        return new CartItemDao(data.item, data.quantity, data.owner)
    });

    // @ts-ignore
    return reconstituteFromDao(cartDao);
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
