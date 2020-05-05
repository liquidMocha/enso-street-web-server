import {Condition} from "../item/Condition";
import ItemLocation from "../item/ItemLocation";
import {Coordinates} from "../location/Coordinates";
import {DELIVERY_STARTING_DISTANCE_IN_MILES} from "../Constants";

export class OrderItem {
    readonly itemId: string;
    readonly title: string;
    readonly description: string;
    readonly imageUrl: string;
    readonly rentalDailyPrice: number;
    readonly deposit: number;
    readonly condition: Condition;
    readonly canBeDelivered: boolean;
    readonly deliveryStarting: number;
    readonly deliveryAdditional: number;
    readonly location: ItemLocation;

    constructor(
        {itemId, title, description, imageUrl, rentalDailyPrice, deposit, condition, canBeDelivered, deliveryStarting, deliveryAdditional, location}: { itemId: string, title: string, description: string, imageUrl: string, rentalDailyPrice: number, deposit: number, condition: Condition, canBeDelivered: boolean, deliveryStarting: number, deliveryAdditional: number, location: ItemLocation }
    ) {
        this.itemId = itemId;
        this.title = title;
        this.description = description;
        this.imageUrl = imageUrl;
        this.rentalDailyPrice = rentalDailyPrice;
        this.deposit = deposit;
        this.condition = condition;
        this.canBeDelivered = canBeDelivered;
        this.deliveryStarting = deliveryStarting;
        this.deliveryAdditional = deliveryAdditional;
        this.location = location;
    }

    getDeliveryFee(distance: number): number {
        const deliveryStarting = this.deliveryStarting;
        if (distance <= DELIVERY_STARTING_DISTANCE_IN_MILES) {
            return deliveryStarting;
        } else {
            const additionalMiles = distance - DELIVERY_STARTING_DISTANCE_IN_MILES;
            return deliveryStarting + this.deliveryAdditional * Math.ceil(additionalMiles);
        }
    }

    get coordinates(): Coordinates {
        return this.location.coordinates;
    }
}
