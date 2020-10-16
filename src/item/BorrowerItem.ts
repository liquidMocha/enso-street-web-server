import {Coordinates} from "../location/Coordinates";
import {Condition} from "./Condition";

export default class BorrowerItem {
    readonly itemId: string;
    readonly title: string;
    readonly description: string;
    readonly ownerEmail: string;
    readonly ownerAlias: string;
    readonly deposit: number;
    readonly rentalDailyPrice: number;
    readonly deliveryAdditional: number;
    readonly deliveryStarting: number;
    readonly condition: Condition;
    readonly imageUrl: string;
    readonly canBeDelivered: boolean;
    readonly coordinates: Coordinates;
    readonly createdOn: Date;

    constructor(
        {itemId, title, description, ownerEmail, ownerAlias, deposit, rentalDailyPrice, deliveryAdditional, deliveryStarting, condition, imageUrl, canBeDelivered, coordinates, createdOn}: { itemId: string, title: string, description: string, ownerEmail: string, ownerAlias: string, deposit: number, rentalDailyPrice: number, deliveryAdditional: number, deliveryStarting: number, condition: Condition, imageUrl: string, canBeDelivered: boolean, coordinates: Coordinates, createdOn: Date }
    ) {
        this.itemId = itemId;
        this.title = title;
        this.description = description;
        this.ownerEmail = ownerEmail;
        this.ownerAlias = ownerAlias;
        this.deposit = deposit;
        this.rentalDailyPrice = rentalDailyPrice;
        this.deliveryAdditional = deliveryAdditional;
        this.deliveryStarting = deliveryStarting;
        this.condition = condition;
        this.imageUrl = imageUrl;
        this.canBeDelivered = canBeDelivered;
        this.coordinates = coordinates;
        this.createdOn = createdOn;
    }
}
