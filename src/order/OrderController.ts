import express, {NextFunction, Request, Response} from "express";
import {requireAuthentication} from "../user/AuthenticationCheck";
import {getReceivedOrders} from "./OrderRepository";

const router = express.Router();

router.get('/', requireAuthentication, getOrders);

async function getOrders(request: Request, response: Response, next: NextFunction) {
    const userId = request.session?.userId;

    response.json((await getReceivedOrders(userId)));
}

export default router;
