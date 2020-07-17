import * as StripeClient from "../../src/stripe/StripeClient";
import {createPaymentIntentFor} from "../../src/transaction/TransactionService";
import {Order} from "../../src/order/Order";
import {OrderItem} from "../../src/transaction/OrderItem";
import {OrderLineItem} from "../../src/transaction/OrderLineItem";
import sinon from "sinon";
import {Renter} from "../../src/order/Renter";

describe('TransactionService', () => {
    let createPaymentIntentForStub;
    before(() => {
        createPaymentIntentForStub = sinon.stub(StripeClient, 'createPaymentIntentOf');
    });

    it('should create payment intent from order', () => {
        const orderItem1 = new OrderItem({rentalDailyPrice: 5});
        const orderItem2 = new OrderItem({rentalDailyPrice: 5});
        const lineItem1 = new OrderLineItem(orderItem1, 5);
        const lineItem2 = new OrderLineItem(orderItem2, 3);
        const lineItems = [
            lineItem1,
            lineItem2
        ]
        const startTime = new Date('May 9, 1975 16:00:00 GMT-3:00');
        const returnTime = new Date('May 11, 1975 16:00:00 GMT-3:00');
        const order = new Order(
            {
                orderItems: lineItems,
                startTime: startTime,
                returnTime: returnTime,
                deliveryFee: 0.00,
                renter: new Renter("", "", true)
            }
        );
        createPaymentIntentFor(order);

        sinon.assert.calledWith(createPaymentIntentForStub, order);
    })
})
