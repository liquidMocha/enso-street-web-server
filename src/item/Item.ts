import {Category} from "../category/Category";
import {Condition} from "./Condition";
import {uuid} from "uuidv4";
import UpdateItem from "./UpdateItem";
import ItemLocation from "./ItemLocation";

export class Item {
    readonly id: string;
    title: string;
    description: string;
    categories: Category[];
    readonly createdOn: Date;
    imageUrl: string;
    rentalDailyPrice: number;
    deposit: number;
    condition: Condition;
    canBeDelivered: boolean;
    deliveryStarting: number;
    deliveryAdditional: number;
    location: ItemLocation;
    //TODO: change owner email to be User/Owner entity
    readonly ownerEmail: string;
    searchable: boolean;
    private _archived: boolean;

    constructor(
        {id, title, description, categories, imageUrl, rentalDailyPrice, deposit, condition, canBeDelivered, deliveryStarting, deliveryAdditional, location, ownerEmail, searchable, archived, createdOn}: { id: string | undefined, title: string, description: string, categories: Category[], imageUrl: string, rentalDailyPrice: number, deposit: number, condition: Condition, canBeDelivered: boolean, deliveryStarting: number, deliveryAdditional: number, location: ItemLocation, ownerEmail: string, searchable: boolean, archived: boolean, createdOn: Date }
    ) {
        this.id = id || uuid();
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
        this.ownerEmail = ownerEmail;
        this.searchable = searchable;
        this._archived = archived;
        this.createdOn = createdOn;
    }

    archive() {
        this._archived = true;
    }

    update(updateItem: UpdateItem) {
        this.title = updateItem.title;
        this.description = updateItem.description;
        if (updateItem.categories.length !== 0) {
            this.categories = updateItem.categories;
        }
        this.imageUrl = updateItem.imageUrl;
        this.rentalDailyPrice = updateItem.rentalDailyPrice;
        this.deposit = updateItem.deposit;
        this.condition = updateItem.condition;
        this.canBeDelivered = updateItem.canBeDelivered;
        this.deliveryStarting = updateItem.deliveryStarting;
        this.deliveryAdditional = updateItem.deliveryAdditional;
        if (updateItem.location.address.street !== this.location.address.street ||
            updateItem.location.address.city !== this.location.address.city ||
            updateItem.location.address.state !== this.location.address.state ||
            updateItem.location.address.zipCode !== this.location.address.zipCode) {
            this.location = updateItem.location
        }
        this.searchable = updateItem.searchable;
    }

    get archived(): boolean {
        return this._archived;
    }
}