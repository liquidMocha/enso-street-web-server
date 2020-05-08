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

    authorizePayment(): void {
        if (OrderStatus.FUND_NOT_AUTHORIZED === this.status) {
            this.status = OrderStatus.PENDING;
        } else {
            throw Error(`Illegal status transition for order: ${this.id}`)
        }
    }

    cancel(): void {
        if (
            OrderStatus.CONFIRMED === this.status ||
            OrderStatus.PENDING === this.status
        ) {
            this.status = OrderStatus.CANCELLED;
        } else {
            throw Error(`Illegal status transition for order: ${this.id}`)
        }
    }

    confirm(): void {
        if (OrderStatus.PENDING === this.status) {
            this.status = OrderStatus.CONFIRMED;
        } else {
            throw Error(`Illegal status transition for order: ${this.id}`)
        }
    }

    complete(): void {
        if (OrderStatus.CONFIRMED === this.status) {
            this.status = OrderStatus.COMPLETED;
        } else {
            throw Error(`Illegal status transition for order: ${this.id}`);
        }
    }

    totalDeposits(): number {
        return this.orderLineItems.reduce((aggregate, lineItem) => {
            return aggregate + lineItem.orderItem.deposit * lineItem.quantity
        }, 0)
    }
}
