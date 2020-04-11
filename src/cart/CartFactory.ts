import {Cart} from "./domain/Cart";
import {CartItem} from "./domain/CartItem";
import {CartItemDao} from "./CartItemDao";
import {CartOwnerBatch} from "./domain/CartOwnerBatch";

export const reconstitueFromDao = (cartDaos: CartItemDao[]): Cart => {
    const ownerBatches: CartOwnerBatch[] = [];
    cartDaos.forEach(item => {
        const existingOwnerBatch = ownerBatches.find(batch => batch.ownerId === item.owner);

        if (existingOwnerBatch) {
            existingOwnerBatch.pushItem(item.id, item.quantity);
        } else {
            const newCartOwnerBatch = new CartOwnerBatch(
                item.owner, new CartItem(item.id, item.quantity)
            );
            ownerBatches.push(newCartOwnerBatch);
        }
    });

    return new Cart(ownerBatches);
};
