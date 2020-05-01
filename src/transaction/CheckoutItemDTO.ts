export class CheckoutItemDTO {
    public readonly id: string;
    public readonly quantity: number;

    constructor(id: string, quantity: number) {
        this.id = id;
        this.quantity = quantity;
    }
}
