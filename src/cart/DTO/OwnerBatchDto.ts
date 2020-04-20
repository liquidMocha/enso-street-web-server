export class CartItemDto {
    private id: string;
    private quantity: number;
    private title: string;
    private rentalDailyPrice: number;
    private imageUrl: string;
    private canBeDelivered: boolean;

    constructor(
        id: string,
        title: string,
        rentalDailyPrice: number,
        imageUrl: string,
        quantity: number,
        canBeDelivered: boolean
    ) {
        this.quantity = quantity;
        this.id = id;
        this.title = title;
        this.rentalDailyPrice = rentalDailyPrice;
        this.imageUrl = imageUrl;
        this.canBeDelivered = canBeDelivered
    }
}

export class OwnerBatchDto {
    private ownerName: string;
    private ownerEmail: string;
    private items: CartItemDto[];

    constructor(ownerName: string, ownerEmail: string, items: CartItemDto[]) {
        this.ownerName = ownerName;
        this.ownerEmail = ownerEmail;
        this.items = items;
    }
}
