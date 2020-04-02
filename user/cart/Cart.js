import {CartItem} from "./CartItem";

export class Cart {
    constructor({cartItems: items}) {
        this.items = items;
    }

    addItem = (itemId) => {
        const existingItem = this.items.find(cartItem => cartItem.id === itemId);

        if (existingItem) {
            existingItem.increment();
        } else {
            this.items.push(
                new CartItem({itemId: itemId, quantity: 1})
            )
        }
    };

    removeItem = (itemId) => {
        const existingItem = this.items.find(cartItem => cartItem.id === itemId);

        existingItem.decrement();
    };

    removeAllInstanceOfItem = (itemId) => {
        const existingItem = this.items.find(cartItem => cartItem.id === itemId);

        existingItem.remove();
    }
}
