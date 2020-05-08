import database from '../database.js';
import {Order} from "./Order";
import {OrderItem} from "../transaction/OrderItem";
import {getGeographicLocationFrom} from "../GeographicUtil";
import {OrderLineItem} from "../transaction/OrderLineItem";
import UserRepository from "../user/UserRepository";
import {Owner} from "../item/Owner";
import ItemLocation from "../item/ItemLocation";
import Address from "../location/Address";
import {Coordinates} from "../location/Coordinates";
import {Condition} from "../item/Condition";

export async function save(order: Order): Promise<any> {
    return database.tx('save new order', async t => {
        const insertOrder = t.none(`
            INSERT INTO "order"(id, payment_intent_id, start_time, return_time, status, executor)
            VALUES ($1, $2, $3, $4, $5, $6)
        `, [
            order.id,
            order.paymentIntentId,
            order.startTime,
            order.returnTime,
            order.status,
            order.executor.id
        ]);

        const insertOrderItems = order.orderLineItems.map(async orderLineItem => {
            const geographicLocation = getGeographicLocationFrom(orderLineItem.orderItem.location.coordinates);
            const conditionId = getConditionId(orderLineItem.orderItem.condition);

            t.none(`
                INSERT INTO order_line_item(order_id,
                                            item_id,
                                            quantity,
                                            title,
                                            description,
                                            image_url,
                                            rental_daily_price,
                                            deposit,
                                            condition,
                                            can_be_delivered,
                                            delivery_starting,
                                            delivery_additional,
                                            street,
                                            city,
                                            state,
                                            zip_code,
                                            coordinates)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, ${geographicLocation})
            `, [
                order.id,
                orderLineItem.orderItem.itemId,
                orderLineItem.quantity,
                orderLineItem.orderItem.title,
                orderLineItem.orderItem.description,
                orderLineItem.orderItem.imageUrl,
                orderLineItem.orderItem.rentalDailyPrice,
                orderLineItem.orderItem.deposit,
                await conditionId,
                orderLineItem.orderItem.canBeDelivered,
                orderLineItem.orderItem.deliveryStarting,
                orderLineItem.orderItem.deliveryAdditional,
                orderLineItem.orderItem.location.address.street,
                orderLineItem.orderItem.location.address.city,
                orderLineItem.orderItem.location.address.state,
                orderLineItem.orderItem.location.address.zipCode
            ])
        });

        await Promise.all(insertOrderItems);
        await insertOrder;
    }).catch(e => {
        console.trace(`Error saving order: ${order}\n`, e);
    });
}

export async function getByPaymentIntentId(paymentIntentId: string): Promise<Order> {
    const orderDao = await database.one(`
        SELECT id, payment_intent_id, start_time, return_time, status, executor
        FROM "order"
        WHERE payment_intent_id = $1
    `, [paymentIntentId]);

    const orderLineItems = await getLineItemsForOrder(orderDao.id);
    const ownerEmail = await UserRepository.getEmailById(orderDao.executor);

    return new Order(
        orderDao.id,
        orderLineItems,
        orderDao.payment_intent_id,
        new Date(orderDao.start_time),
        new Date(orderDao.return_time),
        new Owner(orderDao.id, ownerEmail),
        orderDao.status
    );
}

export function update(order: Order) {
    return database.none(`
        UPDATE "order"
        SET status = $1
        WHERE id = $2
    `, [order.status, order.id])
}

export async function getReceivedOrders(userId: string): Promise<Order[]> {
    const orderDAOs = await database.manyOrNone(`
        SELECT id, payment_intent_id, start_time, return_time, status
        FROM "order"
        WHERE executor = $1
    `, [userId]);

    const userEmail = await UserRepository.getEmailById(userId);
    const orders = orderDAOs.map(async orderDao => {
        const orderItems = getLineItemsForOrder(orderDao.id);

        return new Order(
            orderDao.id,
            (await orderItems),
            orderDao.payment_intent_id,
            new Date(orderDao.start_time),
            new Date(orderDao.return_time),
            new Owner(userId, userEmail),
            orderDao.status
        )
    });

    return await Promise.all(orders);
}

export async function getOrderById(orderId: string): Promise<Order> {
    const orderDao = await database.one(`
        SELECT id, payment_intent_id, start_time, return_time, status, executor
        FROM "order"
        WHERE id = $1
    `, [orderId]);

    const userEmail = await UserRepository.getEmailById(orderDao.executor);
    const lineItems = getLineItemsForOrder(orderDao.id);
    return new Order(
        orderDao.id,
        (await lineItems),
        orderDao.payment_intent_id,
        new Date(orderDao.start_time),
        new Date(orderDao.return_time),
        new Owner(orderDao.executor, userEmail),
        orderDao.status
    )
}

const getConditionId = (condition: Condition): Promise<number> => {
    return database.one(`SELECT id
                         FROM public.condition
                         WHERE condition = $1`,
        [condition],
        result => result.id
    );
};

async function getLineItemsForOrder(orderId: string): Promise<OrderLineItem[]> {
    return database.map(`
        SELECT item_id,
               quantity,
               title,
               description,
               image_url,
               rental_daily_price,
               deposit,
               condition,
               can_be_delivered,
               delivery_starting,
               delivery_additional,
               street,
               city,
               state,
               zip_code,
               ST_X(coordinates::geometry) AS longitude,
               ST_Y(coordinates::geometry) AS latitude
        FROM order_line_item
        WHERE order_id = $1;
    `, [orderId], data => {
        return new OrderLineItem(
            new OrderItem(
                {
                    itemId: data.item_id,
                    title: data.title,
                    description: data.description,
                    imageUrl: data.image_url,
                    rentalDailyPrice: data.rental_daily_price,
                    deposit: data.deposit,
                    condition: data.condition,
                    canBeDelivered: data.can_be_delivered,
                    deliveryStarting: data.delivery_starting,
                    deliveryAdditional: data.delivery_additional,
                    location: new ItemLocation(
                        new Address({
                            street: data.street,
                            city: data.city,
                            state: data.state,
                            zipCode: data.zipCode
                        }),
                        new Coordinates(data.latitude, data.longitude)
                    )
                }),
            data.quantity
        );
    });
}
