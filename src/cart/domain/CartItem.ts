export class CartItem {
    get quantity(): number {
        return this._quantity;
    }

    readonly id: string;
    private _quantity: number;

    constructor(itemId: string, quantity: number) {
        this.id = itemId;
        this._quantity = quantity;
    }

    increment = () => {
        this._quantity++
    };

    decrement = () => {
        if (this._quantity > 0) {
            this._quantity--
        }
    };

    remove = () => {
        this._quantity = 0;
    };
}
