import express, {NextFunction, Request, Response} from "express";
import {requireAuthentication} from "../user/AuthenticationCheck";
import {sameProcessOrderRepository} from "../ApplicationContext";
import {orderToDto} from "../order/OrderDto";

const router = express.Router();
const orderRepository = sameProcessOrderRepository;

router.get('/', requireAuthentication, getReservations);

async function getReservations(request: Request, response: Response, next: NextFunction) {
    const userId = request.session?.userId;

    const orders = await orderRepository.getReservationsFor(userId);
    const orderDtos = orders.map(order => orderToDto(order))
    response.json(orderDtos);
}

export default router;
