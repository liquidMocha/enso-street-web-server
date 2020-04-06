import {Cart} from "./Cart";
import {CartItem} from "./CartItem";
import {CartItemDao} from "./CartItemDao";
import {CartOwnerBatch} from "./CartOwnerBatch";

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
