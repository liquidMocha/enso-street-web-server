import {OrderStatus} from "./OrderStatus";
import {OrderLineItem} from "../transaction/OrderLineItem";
import {Owner} from "../item/Owner";
import {Coordinates} from "../location/Coordinates";
import Address from "../location/Address";
import {Renter} from "./Renter";

export class Order {
    THREE_DAYS = 1000 * 60 * 60 * 24 * 3;

    get status(): OrderStatus {
        if (new Date().getTime() - this.createdOn.getTime() > this.THREE_DAYS &&
            this._status === OrderStatus.PENDING) {
            return OrderStatus.EXPIRED;
        } else {
            return this._status;
        }
    }

    get paymentIntentId(): string | undefined {
        return this._paymentIntentId;
    }

    set paymentIntentId(value: string | undefined) {
        if (this._paymentIntentId) {
            throw Error(`Cannot change payment intent for order ${this.id}`)
        } else {
            this._paymentIntentId = value;
        }
    }

    readonly id: string;
    readonly orderLineItems: OrderLineItem[];
    private _paymentIntentId?: string;
    readonly startTime: Date;
    readonly returnTime: Date;
    private _status: OrderStatus;
    readonly executor: Owner;
    readonly deliveryAddress?: Address;
    readonly deliveryCoordinates?: Coordinates;
    readonly deliveryFee: number;
    readonly renter: Renter;
    private readonly createdOn: Date;

    constructor(
        {id, orderItems, startTime, returnTime, executor, status = OrderStatus.FUND_NOT_AUTHORIZED, deliveryCoordinates, deliveryAddress, paymentIntentId, deliveryFee = 0, renter, createdOn = new Date()}:
            {
                id: string,
                orderItems: OrderLineItem[],
                startTime: Date,
                returnTime: Date,
                executor: Owner,
                renter: Renter,
                status?: OrderStatus,
                deliveryCoordinates?: Coordinates,
                deliveryAddress?: Address,
                paymentIntentId?: string,
                deliveryFee?: number,
                createdOn?: Date
            }
    ) {
        this.id = id;
        this.orderLineItems = orderItems;
        this._paymentIntentId = paymentIntentId;
        this.startTime = startTime;
        this.returnTime = returnTime;
        this._status = status;
        this.executor = executor;
        this.deliveryAddress = deliveryAddress;
        this.deliveryCoordinates = deliveryCoordinates;
        this.deliveryFee = deliveryFee;
        this.renter = renter;
        this.createdOn = createdOn;
    }

    authorizePayment(): void {
        if (OrderStatus.FUND_NOT_AUTHORIZED === this._status) {
            this._status = OrderStatus.PENDING;
        } else {
            throw Error(`Illegal status transition for order: ${this.id}`)
        }
    }

    cancel(): void {
        if (
            OrderStatus.CONFIRMED === this._status ||
            OrderStatus.PENDING === this._status
        ) {
            this._status = OrderStatus.CANCELLED;
        } else {
            throw Error(`Illegal status transition for order: ${this.id}`)
        }
    }

    confirm(): void {
        if (OrderStatus.PENDING === this._status) {
            this._status = OrderStatus.CONFIRMED;
        } else {
            throw Error(`Illegal status transition for order: ${this.id}`)
        }
    }

    complete(): void {
        if (OrderStatus.CONFIRMED === this._status) {
            this._status = OrderStatus.COMPLETED;
        } else {
            throw Error(`Illegal status transition for order: ${this.id}`);
        }
    }

    totalDeposits(): number {
        return this.orderLineItems.reduce((aggregate, lineItem) => {
            return aggregate + lineItem.orderItem.deposit * lineItem.quantity
        }, 0)
    }

    get itemSubtotal(): number {
        return this.orderLineItems
            .map(orderItem => orderItem.getRentalFee(this.rentalDays, orderItem.quantity))
            .reduce((aggregate, itemRental) => {
                return aggregate + itemRental;
            }, 0);
    }

    get rentalDays(): number {
        return Math.floor(
            (
                Date.UTC(this.returnTime.getFullYear(), this.returnTime.getMonth(), this.returnTime.getDate())
                - Date.UTC(this.startTime.getFullYear(), this.startTime.getMonth(), this.startTime.getDate())
            )
            / (1000 * 60 * 60 * 24),
        ) + 1;
    };

    hasTrustedRenter(): boolean {
        return this.renter.trusted;
    }

    get charge(): number {
        let charge = this.itemSubtotal + this.deliveryFee;

        if (charge >= this.totalDeposits() || this.hasTrustedRenter()) {
            return charge;
        } else {
            return charge + this.totalDeposits();
        }
    }
}
