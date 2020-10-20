import {OrderStatus} from "./OrderStatus";
import {OrderLineItem} from "../transaction/OrderLineItem";
import Address from "../location/Address";
import {Coordinates} from "../location/Coordinates";
import {Renter} from "./Renter";
import {Order} from "./Order";
import {OwnerDTO, ownerToDto} from "./OwnerDTO";

export interface OrderDto {
    id: string,
    orderLineItems: OrderLineItem[],
    startTime: Date,
    returnTime: Date,
    status: OrderStatus,
    deliveryAddress?: Address,
    deliveryCoordinates?: Coordinates,
    deliveryFee: number,
    renter: Renter,
    executor: OwnerDTO
}

export function orderToDto(order: Order): OrderDto {
    return {
        id: order.id,
        orderLineItems: order.orderLineItems,
        startTime: order.startTime,
        returnTime: order.returnTime,
        status: order.status,
        deliveryAddress: order.deliveryAddress,
        deliveryCoordinates: order.deliveryCoordinates,
        deliveryFee: order.deliveryFee,
        renter: order.renter,
        executor: ownerToDto(order.executor)
    }
}
