import {Category} from "../category/Category";
import {Condition} from "./Condition";
import ItemLocationDTO from "../location/ItemLocationDTO";

export default class UpdateItem {
    readonly title: string;
    readonly description: string;
    readonly categories: Category[];
    readonly imageUrl: string;
    readonly rentalDailyPrice: number;
    readonly deposit: number;
    readonly condition: Condition;
    readonly canBeDelivered: boolean;
    readonly deliveryStarting: number;
    readonly deliveryAdditional: number;
    readonly location: ItemLocationDTO;
    readonly searchable: boolean;
    readonly archived: boolean;

    constructor(
        {
            title,
            description,
            categories,
            imageUrl,
            rentalDailyPrice,
            deposit,
            condition,
            canBeDelivered,
            deliveryStarting,
            deliveryAdditional,
            location,
            searchable,
            archived,
        }: {
            title: string,
            description: string,
            categories: Category[],
            imageUrl: string,
            rentalDailyPrice: number,
            deposit: number,
            condition: Condition,
            canBeDelivered: boolean,
            deliveryStarting: number,
            deliveryAdditional: number,
            location: ItemLocationDTO,
            searchable: boolean,
            archived: boolean
        }
    ) {
        this.title = title;
        this.description = description;
        this.categories = categories;
        this.imageUrl = imageUrl;
        this.rentalDailyPrice = rentalDailyPrice;
        this.deposit = deposit;
        this.condition = condition;
        this.canBeDelivered = canBeDelivered;
        this.deliveryStarting = deliveryStarting;
        this.deliveryAdditional = deliveryAdditional;
        this.location = location;
        this.searchable = searchable;
        this.archived = archived;
    }

}
