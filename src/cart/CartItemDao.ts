export class CartItemDao {
    readonly id: string;
    readonly quantity: number;
    readonly owner: string;

    constructor(
        id: string, quantity: number, owner: string
    ) {
        this.id = id;
        this.quantity = quantity;
        this.owner = owner;
    }

}
