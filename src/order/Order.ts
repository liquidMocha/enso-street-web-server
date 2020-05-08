import {OrderStatus} from "./OrderStatus";
import {OrderLineItem} from "../transaction/OrderLineItem";
import {Owner} from "../item/Owner";

export class Order {
    readonly id: string;
    readonly orderLineItems: OrderLineItem[];
    readonly paymentIntentId: string;
    readonly startTime: Date;
    readonly returnTime: Date;
    status: OrderStatus;
    readonly executor: Owner;

    constructor(
        id: string,
        orderItems: OrderLineItem[],
        paymentIntentId: string,
        startTime: Date,
        returnTime: Date,
        executor: Owner,
        status: OrderStatus = OrderStatus.FUND_NOT_AUTHORIZED
    ) {
        this.id = id;
        this.orderLineItems = orderItems;
        this.paymentIntentId = paymentIntentId;
        this.startTime = startTime;
        this.returnTime = returnTime;
        this.status = status;
        this.executor = executor;
    }

    authorizePayment() {
        this.status = OrderStatus.PENDING;
    }

    cancel(userId: string) {
        if (this.executor.id === userId) {
            this.status = OrderStatus.CANCELLED;
        } else {
            throw Error(`${userId} cannot cancel this order.`);
        }
    }
}
