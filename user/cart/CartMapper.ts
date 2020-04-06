import {CartItemDao} from "./CartItemDao";
import {Cart} from "./Cart";

export class CartMapper {
    static toDao(cart: Cart): CartItemDao[] {
        const result: CartItemDao[] = [];
        cart.ownerBatches.forEach(batch => {
            batch.cartItems.forEach(item => {
                result.push(new CartItemDao(item.id, item.quantity, batch.ownerId))
            })
        });

        return result;
    }
}
