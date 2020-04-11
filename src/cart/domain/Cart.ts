import {CartItem} from "./CartItem";
import {CartOwnerBatch} from "./CartOwnerBatch";

export class Cart {
    readonly ownerBatches: CartOwnerBatch[];

    constructor(ownerBatches: CartOwnerBatch[]) {
        this.ownerBatches = ownerBatches;
    }

    addItem = (itemId: string, ownerId: string) => {
        const ownerBatch = this.findOwnerBatch(ownerId);

        if (ownerBatch) {
            ownerBatch.addItem(itemId);
        } else {
            this.ownerBatches.push(
                new CartOwnerBatch(ownerId, new CartItem(itemId, 1))
            )
        }
    };

    removeItem = (itemId: string, ownerId: string) => {
        const ownerBatch = this.findOwnerBatch(ownerId);

        ownerBatch?.removeOneItem(itemId);
    };

    removeAllInstanceOfItem = (itemId: string, ownerId: string) => {
        const ownerBatch = this.findOwnerBatch(ownerId);

        ownerBatch?.removeAllInstancesOfItem(itemId);
    };

    private findOwnerBatch(ownerId: string): CartOwnerBatch | undefined {
        return this.ownerBatches.find(
            batch => batch.ownerId === ownerId
        );
    }
}
