import ItemLocationDTO from "../location/ItemLocationDTO";

export default class ItemDTO {
    readonly id: string;
    readonly title: string;
    readonly rentalDailyPrice: number;
    readonly deposit: number;
    readonly condition: string;
    readonly categories: string[];
    readonly description: string;
    readonly canBeDelivered: boolean;
    readonly deliveryStarting: number;
    readonly deliveryAdditional: number;
    readonly location: ItemLocationDTO;
    readonly userEmail: string;
    readonly imageUrl: string;
    readonly searchable: boolean
    readonly archived: boolean;
    readonly createdOn: Date;

    constructor(
        id: string,
        title: string,
        rentalDailyPrice: number,
        deposit: number,
        condition: string,
        categories: string[],
        description: string,
        canBeDelivered: boolean,
        deliveryStarting: number,
        deliveryAdditional: number,
        location: ItemLocationDTO,
        userEmail: string,
        imageUrl: string,
        searchable: boolean,
        archived: boolean,
        createdOn: Date
    ) {
        try {
            this.id = id;
            this.title = title;
            this.rentalDailyPrice = Number(rentalDailyPrice);
            this.deposit = Number(deposit);
            this.condition = condition;
            this.categories = categories || [];
            this.description = description;
            this.canBeDelivered = canBeDelivered;
            this.deliveryStarting = Number(deliveryStarting);
            this.deliveryAdditional = Number(deliveryAdditional);
            this.location = location;
            this.userEmail = userEmail;
            this.imageUrl = imageUrl;
            this.searchable = searchable;
            this.archived = archived;
            this.createdOn = createdOn;
        } catch (e) {
            console.error(`Unable to deserialize item: ${e}`)
        }
    }
}
