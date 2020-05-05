import {OrderItem} from "./OrderItem";

export class OrderLineItem {
    readonly orderItem: OrderItem;
    readonly quantity: number;

    constructor(orderItem: OrderItem, quantity: number) {
        this.orderItem = orderItem;
        this.quantity = quantity;
    }

    getRentalFee(days: number, quantity: number): number {
        return this.orderItem.rentalDailyPrice * days * quantity;
    }
}
