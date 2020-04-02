export class CartItem {
    constructor({itemId: itemId, quantity: quantity}) {
        this.id = itemId;
        this.quantity = quantity;
    }

    increment = () => {
        this.quantity++
    };

    decrement = () => {
        if (this.quantity > 0) {
            this.quantity--
        }
    }
}
