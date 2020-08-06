import database from '../database.js';
import {Order} from "./Order";
import {OrderItem} from "../transaction/OrderItem";
import {getGeographicLocationFrom} from "../GeographicUtil";
import {OrderLineItem} from "../transaction/OrderLineItem";
import UserRepository from "../user/UserRepository";
import ItemLocation from "../item/ItemLocation";
import Address from "../location/Address";
import {Coordinates} from "../location/Coordinates";
import {Condition} from "../item/Condition";
import {UserAdaptor} from "./UserAdaptor";
import {Renter} from "./Renter";
import {UserProfileDto} from "../userprofile/UserProfileDto";

export class OrderRepository {
    private userAdaptor: UserAdaptor;
    private readonly NUMBER_OF_ORDERS_REQUIRED_TO_BE_TRUSTED: number;

    constructor(userAdaptor: UserAdaptor, NUMBER_OF_ORDERS_REQUIRED_TO_BE_TRUSTED: number) {
        this.userAdaptor = userAdaptor;
        this.NUMBER_OF_ORDERS_REQUIRED_TO_BE_TRUSTED = NUMBER_OF_ORDERS_REQUIRED_TO_BE_TRUSTED;
    }

    async save(order: Order): Promise<any> {
        return database.tx('save new order', async t => {
            const geographicLocation = getGeographicLocationFrom(order.deliveryCoordinates);

            const insertOrder = t.none(`
            INSERT INTO "order"(id,
                                payment_intent_id,
                                start_time,
                                return_time,
                                status,
                                executor,
                                street,
                                city,
                                state,
                                zip_code,
                                delivery_fee,
                                delivery_coordinates,
                                renter)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, ${geographicLocation}, $12)
        `, [
                order.id,
                order.paymentIntentId,
                order.startTime,
                order.returnTime,
                order.status,
                order.executor.id,
                order.deliveryAddress?.street,
                order.deliveryAddress?.city,
                order.deliveryAddress?.state,
                order.deliveryAddress?.zipCode,
                order.deliveryFee,
                order.renter.id
            ]);

            const insertOrderItems = order.orderLineItems.map(async orderLineItem => {
                const geographicLocation = getGeographicLocationFrom(orderLineItem.orderItem.location.coordinates);
                const conditionId = this.getConditionId(orderLineItem.orderItem.condition);

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

    async getByPaymentIntentId(paymentIntentId: string): Promise<Order> {
        const orderDao = await database.one(`
        ${this.selectOrder()}
        WHERE payment_intent_id = $1
    `, [paymentIntentId]);

        const orderLineItems = await this.getLineItemsForOrder(orderDao.id);
        const ownerEmail = await UserRepository.getEmailById(orderDao.executor);

        return this.reconstituteOrder(orderDao, ownerEmail, orderLineItems);
    }

    async update(order: Order): Promise<null> {
        return await database.none(`
            UPDATE "order"
            SET status            = $1,
                payment_intent_id = $3
            WHERE id = $2
        `, [order.status, order.id, order.paymentIntentId])
    }

    async getReceivedOrders(userId: string): Promise<Order[]> {
        const orderDAOs = await database.manyOrNone(`
        ${this.selectOrder()}
        WHERE executor = $1 AND status != 'FUND_NOT_AUTHORIZED'
    `, [userId]);

        const userEmail = await UserRepository.getEmailById(userId);
        const orders = orderDAOs.map(async orderDao => {
            const orderItems = this.getLineItemsForOrder(orderDao.id);

            return this.reconstituteOrder(orderDao, userEmail, await orderItems);
        });

        return await Promise.all(orders);
    }

    async reconstitueRenter(userProfileDto: UserProfileDto): Promise<Renter> {
        const isTrustedRenter = (await this.orderCountForRenter(userProfileDto.user.id)) >= this.NUMBER_OF_ORDERS_REQUIRED_TO_BE_TRUSTED;
        return new Renter(
            userProfileDto.user.id,
            `${userProfileDto.firstName} ${userProfileDto.lastName}`,
            isTrustedRenter
        )
    }

    async reconstituteOrder(orderDao: any, userEmail: string, lineItems: OrderLineItem[]) {
        const renterId = orderDao.renter;
        const userProfileDto = await this.userAdaptor.getRenterById(renterId);
        const owner = await this.userAdaptor.getOwnerById(orderDao.executor);

        return new Order(
            {
                id: orderDao.id,
                orderItems: lineItems,
                startTime: new Date(orderDao.start_time),
                returnTime: new Date(orderDao.return_time),
                executor: owner,
                status: orderDao.status,
                deliveryCoordinates: new Coordinates(orderDao.latitude, orderDao.longitude),
                deliveryAddress: new Address({
                    street: orderDao.street,
                    city: orderDao.city,
                    state: orderDao.city,
                    zipCode: orderDao.zip_code
                }),
                deliveryFee: Number(orderDao.delivery_fee),
                paymentIntentId: orderDao.payment_intent_id,
                renter: await this.reconstitueRenter(userProfileDto),
                createdOn: orderDao.created_on
            }
        )
    }

    selectOrder(): string {
        return `SELECT id,
                       payment_intent_id,
                       start_time,
                       return_time,
                       status,
                       executor,
                       delivery_fee,
                       street,
                       city,
                       state,
                       zip_code,
                       ST_X(delivery_coordinates::geometry) AS longitude,
                       ST_Y(delivery_coordinates::geometry) AS latitude,
                       renter,
                       created_on
                FROM "order" `
    }

    async getOrderById(orderId: string): Promise<Order> {
        try {
            const orderDao = await database.one(`
        ${this.selectOrder()}
        WHERE id = $1
    `, [orderId]);

            const userEmail = await UserRepository.getEmailById(orderDao.executor);
            const lineItems = await this.getLineItemsForOrder(orderDao.id);

            return await this.reconstituteOrder(orderDao, userEmail, lineItems);
        } catch (e) {
            console.error(`Error getting order by ID(${orderId}): ${e}`);
            throw Error(e);
        }
    }

    async getOrderByIdForExecutor(orderId: string, userId: string): Promise<Order> {
        try {
            const orderDao = await database.one(`
        ${this.selectOrder()}
        WHERE id = $1 and executor = $2
    `, [orderId, userId]);

            const userEmail = await UserRepository.getEmailById(orderDao.executor);
            const lineItems = await this.getLineItemsForOrder(orderDao.id);
            return await this.reconstituteOrder(orderDao, userEmail, lineItems);
        } catch (e) {
            console.error(`Error getting order by ID(${orderId}): ${e}`);
            throw Error(e);
        }
    }

    getConditionId = (condition: Condition): Promise<number> => {
        return database.one(`SELECT id
                             FROM public.condition
                             WHERE condition = $1`,
            [condition],
            result => result.id
        );
    };

    async getLineItemsForOrder(orderId: string): Promise<OrderLineItem[]> {
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
                        rentalDailyPrice: Number(data.rental_daily_price),
                        deposit: Number(data.deposit),
                        condition: data.condition,
                        canBeDelivered: data.can_be_delivered,
                        deliveryStarting: Number(data.delivery_starting),
                        deliveryAdditional: Number(data.delivery_additional),
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

    orderCountForRenter(renterId: string) {
        return database.one(`
                    SELECT count("order".id)
                    FROM "order"
                    WHERE renter = $1
            `, [renterId],
            result => Number(result.count));

    }
}
