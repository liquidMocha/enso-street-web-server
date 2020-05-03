import chai, {expect} from 'chai';
import {uuid} from "uuidv4";
import {Order} from "../../src/order/Order";
import {OrderItem} from "../../src/transaction/OrderItem";
import {Item} from "../../src/item/Item";
import {setupItem} from "../TestHelper";
import {getByPaymentIntentId, save} from "../../src/order/OrderRepository";
import {OrderStatus} from "../../src/order/OrderStatus";

chai.use(require('chai-datetime'));

describe('order database', () => {
    it('should retrieve order by payment intent ID', async () => {
        const itemId = uuid();
        await setupItem(itemId);

        const paymentIntentId = "some_pi_id";
        const orderItems = [new OrderItem(new Item({id: itemId}), 1)];
        const orderId = uuid();
        const startTime = new Date();
        const returnTime = new Date();
        const order = new Order(orderId, orderItems, paymentIntentId, startTime, returnTime);

        await save(order);


        const actual = (await getByPaymentIntentId(paymentIntentId));


        expect(actual.id).to.equal(orderId);
        expect(actual.paymentIntentId).to.equal(paymentIntentId);
        expect(actual.startTime).to.equalTime(startTime);
        expect(actual.returnTime).to.equalTime(returnTime);
        expect(actual.status).to.equal(OrderStatus.FUND_NOT_AUTHORIZED);
        expect(actual.orderItems.length).to.equal(1);
        expect(actual.orderItems[0].id).to.equal(orderItems[0].id);
    })
})
