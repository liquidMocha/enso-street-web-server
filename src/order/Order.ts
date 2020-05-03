import {OrderItem} from "../transaction/OrderItem";
import {OrderStatus} from "./OrderStatus";

export class Order {
    readonly id: string;
    readonly orderItems: OrderItem[];
    readonly paymentIntentId: string;
    readonly startTime: Date;
    readonly returnTime: Date;
    status: OrderStatus;

    constructor(
        id: string,
        orderItems: OrderItem[],
        paymentIntentId: string,
        startTime: Date,
        returnTime: Date
    ) {
        this.id = id;
        this.orderItems = orderItems;
        this.paymentIntentId = paymentIntentId;
        this.startTime = startTime;
        this.returnTime = returnTime;
        this.status = OrderStatus.FUND_NOT_AUTHORIZED;
    }

    authorizePayment() {
        this.status = OrderStatus.PENDING;
    }
}
