import {Cart} from "./domain/Cart";
import {CartItem} from "./domain/CartItem";
import {CartItemDao} from "./CartItemDao";
import {CartOwnerBatch} from "./domain/CartOwnerBatch";
import {groupBy, map, mapObjIndexed, pipe, prop, values} from 'ramda';

const cartItemDaoToCartItem = (cartItemDao: CartItemDao) => {
    return new CartItem(cartItemDao.id, cartItemDao.quantity);
}

const createCart = (batches: CartOwnerBatch[]) => {
    return new Cart(batches);
}

export const reconstituteFromDao = pipe<any, any, any, Cart>(
    // @ts-ignore
    groupBy(prop('owner')),
    mapObjIndexed((value, key) => {
        // @ts-ignore
        const cartItems = map(cartItemDaoToCartItem, value);
        return new CartOwnerBatch(key, cartItems);
    }),
    values,
    createCart
);
