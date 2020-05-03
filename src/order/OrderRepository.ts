import database from '../database.js';
import {Order} from "./Order";
import {getItemById} from "../item/ItemRepository";
import {OrderItem} from "../transaction/OrderItem";

export async function save(order: Order): Promise<any> {
    return database.tx('save new order', async t => {
        const insertOrder = t.none(`
            INSERT INTO "order"(id, payment_intent_id, start_time, return_time, status)
            VALUES ($1, $2, $3, $4, $5)
        `, [order.id, order.paymentIntentId, order.startTime, order.returnTime, order.status]);

        const insertOrderItems = order.orderItems.map(orderItem => {
            t.none(`
                INSERT INTO order_item(order_id, item_id, quantity)
                VALUES ($1, $2, $3)
            `, [order.id, orderItem.item.id, orderItem.quantity])
        });

        return t.batch([insertOrderItems, insertOrder]);
    })
}

export async function getByPaymentIntentId(paymentIntentId: string): Promise<Order> {
    const orderDao = await database.one(`
        SELECT id, payment_intent_id, start_time, return_time, status
        FROM "order"
        WHERE payment_intent_id = $1
    `, [paymentIntentId]);

    const orderItems = (await database.map(`
                SELECT item_id, quantity
                FROM order_item
                WHERE order_id = $1;
        `, [orderDao.id], async data => {
            return new OrderItem((await getItemById(data.item_id)), data.quantity);
        })
    );

    return new Order(orderDao.id,
        (await Promise.all(orderItems)),
        orderDao.payment_intent_id,
        new Date(orderDao.start_time),
        orderDao.return_time
    );
}

export function update(order: Order) {
    return database.none(`
        UPDATE "order"
        SET status = $1
        WHERE id = $2
    `, [order.status, order.id])
}
