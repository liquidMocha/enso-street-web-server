export class ItemDto {
    private id: string;
    private quantity: number;
    private title: string;
    private rentalDailyPrice: number;
    private imageUrl: string;

    constructor(
        id: string,
        title: string,
        rentalDailyPrice: number,
        imageUrl: string,
        quantity: number
    ) {
        this.quantity = quantity;
        this.id = id;
        this.title = title;
        this.rentalDailyPrice = rentalDailyPrice;
        this.imageUrl = imageUrl;
    }
}

export class OwnerBatchDto {
    private ownerName: string;
    private ownerEmail: string;
    private items: ItemDto[];

    constructor(ownerName: string, ownerEmail: string, items: ItemDto[]) {
        this.ownerName = ownerName;
        this.ownerEmail = ownerEmail;
        this.items = items;
    }
}
