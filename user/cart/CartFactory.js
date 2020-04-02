import {Cart} from "./Cart";
import {CartItem} from "./CartItem";

export const reconstitueFromDao = (cartDao) => {
    return new Cart({
        cartItems: cartDao.map(item => new CartItem({
            itemId: item.id, quantity: item.quantity
        }))
    })
};
