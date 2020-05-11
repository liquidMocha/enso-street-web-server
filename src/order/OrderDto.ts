import {OrderStatus} from "./OrderStatus";
import {OrderLineItem} from "../transaction/OrderLineItem";
import Address from "../location/Address";
import {Coordinates} from "../location/Coordinates";
import {Renter} from "./Renter";

export interface OrderDto {
    id: string,
    orderLineItems: OrderLineItem[],
    startTime: Date,
    returnTime: Date,
    status: OrderStatus,
    deliveryAddress?: Address,
    deliveryCoordinates?: Coordinates,
    deliveryFee: number,
    renter: Renter
}
