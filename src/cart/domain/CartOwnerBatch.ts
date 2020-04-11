import {CartItem} from "./CartItem";

export class CartOwnerBatch {
    readonly ownerId: string;
    readonly cartItems: CartItem[];

    constructor(
        ownerId: string,
        cartItems: CartItem
    ) {
        this.ownerId = ownerId;
        this.cartItems = [];
        this.cartItems.push(cartItems);
    }

    removeOneItem(itemId: string) {
        this.cartItems.find(item => item.id === itemId)?.decrement();
    }

    removeAllInstancesOfItem(itemId: string) {
        this.cartItems.find(item => item.id === itemId)?.remove();
    }

    addItem(itemId: string) {
        const existingItem = this.cartItems.find(item => item.id === itemId);

        if (existingItem) {
            existingItem.increment();
        } else {
            this.cartItems.push(new CartItem(itemId, 1))
        }
    }

    //TODO: get rid of this. This is not a valid domain operation.
    // This is here only because factory needs a way to construct a batch
    pushItem(itemId: string, quantity: number) {
        this.cartItems.push(new CartItem(itemId, quantity))
    }

}
