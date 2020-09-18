import {Order} from "../../src/order/Order";
import {OrderLineItem} from "../../src/transaction/OrderLineItem";
import {OrderItem} from "../../src/transaction/OrderItem";
import {expect} from 'chai';
import {Renter} from "../../src/order/Renter";
import {OrderStatus} from "../../src/order/OrderStatus";

describe("order domain object", () => {
    it('should return sum of deposits of all line items', () => {
        const items = [
            new OrderLineItem(
                new OrderItem({
                    deposit: 10
                }), 2
            ),
            new OrderLineItem(
                new OrderItem({
                    deposit: 3
                }), 4
            )
        ];
        const subject = new Order(
            {id: "some-id", orderItems: items}
        );

        expect(subject.totalDeposits()).to.equal(10 * 2 + 3 * 4);
    });

    it('should calculate item subtotal', () => {
        const orderItem1 = new OrderItem({rentalDailyPrice: 5});
        const orderItem2 = new OrderItem({rentalDailyPrice: 5});
        const lineItem1 = new OrderLineItem(orderItem1, 5);
        const lineItem2 = new OrderLineItem(orderItem2, 3);
        const lineItems = [lineItem1, lineItem2]
        const startTime = new Date('May 9, 1975 16:00:00 GMT-3:00');
        const returnTime = new Date('May 11, 1975 16:00:00 GMT-3:00');

        const subject = new Order({orderItems: lineItems, startTime: startTime, returnTime: returnTime});

        expect(subject.itemSubtotal).to.equal(
            3 * (
                lineItem1.orderItem.rentalDailyPrice * lineItem1.quantity
                + lineItem2.orderItem.rentalDailyPrice * lineItem2.quantity
            )
        )
    });

    it('should apply discounts for order with more days', () => {
        const orderItem1 = new OrderItem({rentalDailyPrice: 5});
        const orderItem2 = new OrderItem({rentalDailyPrice: 5});
        const lineItem1 = new OrderLineItem(orderItem1, 5);
        const lineItem2 = new OrderLineItem(orderItem2, 3);
        const lineItems = [lineItem1, lineItem2]
        const startTime = new Date('May 9, 1975 16:00:00 GMT-3:00');
        const returnTime = new Date('May 12, 1975 16:00:00 GMT-3:00');

        const subject = new Order({orderItems: lineItems, startTime: startTime, returnTime: returnTime});

        expect(subject.itemSubtotal).to.equal(
            4 * (
                lineItem1.orderItem.rentalDailyPrice * lineItem1.quantity
                + lineItem2.orderItem.rentalDailyPrice * lineItem2.quantity
            ) * 0.85
        )
    });

    describe('calculate order\'s charge', () => {
        it('includes deposits if renter is not trusted and deposit would be more than 50% of the charge', () => {
            const startTime = new Date('May 9, 1975 16:00:00 GMT-3:00');
            const returnTime = new Date('May 11, 1975 16:00:00 GMT-3:00');
            const orderItem = new OrderItem({rentalDailyPrice: 4, deposit: 20});
            const lineItems = [new OrderLineItem(orderItem, 2)]

            const subject = new Order({
                startTime: startTime,
                returnTime: returnTime,
                orderItems: lineItems,
                deliveryFee: 3,
                renter: new Renter("", "", false)
            })

            expect(subject.charge).to.equal((3 * 4 + 20) * 2 + 3);
        })

        it('does not include deposits if renter is trusted', () => {
            const startTime = new Date('May 9, 1975 16:00:00 GMT-3:00');
            const returnTime = new Date('May 11, 1975 16:00:00 GMT-3:00');
            const orderItem = new OrderItem({rentalDailyPrice: 4, deposit: 20});
            const lineItems = [new OrderLineItem(orderItem, 2)]

            const subject = new Order({
                startTime: startTime,
                returnTime: returnTime,
                orderItems: lineItems,
                deliveryFee: 3,
                renter: new Renter("", "", true)
            })

            expect(subject.charge).to.equal((3 * 4) * 2 + 3);
        })

        it('does not include deposits if deposit would be less than 50% of the order', () => {
            const startTime = new Date('May 9, 1975 16:00:00 GMT-3:00');
            const returnTime = new Date('May 11, 1975 16:00:00 GMT-3:00');
            const orderItem = new OrderItem({rentalDailyPrice: 4, deposit: 4});
            const lineItems = [new OrderLineItem(orderItem, 2)]

            const subject = new Order({
                startTime: startTime,
                returnTime: returnTime,
                orderItems: lineItems,
                deliveryFee: 3,
                renter: new Renter("", "", false)
            })

            expect(subject.charge).to.equal((3 * 4) * 2 + 3);
        })
    })

    describe('calculate rental days', () => {
        it('counts as one day if rent and return on the same day', () => {
            const startTime = new Date('May 9, 1975 16:00:00 GMT-3:00');
            const returnTime = new Date('May 9, 1975 17:00:00 GMT-3:00');

            const subject = new Order({
                startTime, returnTime
            });

            expect(subject.rentalDays).to.equal(1);
        });

        it('count rental days as return date minus start date plus 1', () => {
            const startTime = new Date('December 30, 1975 16:00:00 GMT-3:00');
            const returnTime = new Date('January 2, 1976 17:00:00 GMT-3:00');

            const subject = new Order({
                startTime, returnTime
            });

            expect(subject.rentalDays).to.equal(4);
        });
    })

    describe('order status', () => {
        it('return EXPIRED when order is created 3 days ago and status is PENDING', () => {
            const now = new Date();
            const timestamp = new Date().getTime();
            const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 - 1);

            const subject = new Order({
                status: OrderStatus.PENDING,
                createdOn: threeDaysAgo
            });

            expect(subject.status).to.equal(OrderStatus.EXPIRED);
        })

        it('return PENDING when order is created within 3 days and status is PENDING', () => {
            const now = new Date();
            const timestamp = new Date().getTime();
            const lessThanThreeDaysAgo = new Date(now.getTime() - 3 * 23 * 60 * 60 * 1000);

            const subject = new Order({
                status: OrderStatus.PENDING,
                createdOn: lessThanThreeDaysAgo
            });

            expect(subject.status).to.equal(OrderStatus.PENDING);
        })

        it('return order status if status is not pending regardless of when it was created', () => {
            const now = new Date();
            const timestamp = new Date().getTime();
            const aYearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);

            const subject = new Order({
                status: OrderStatus.COMPLETED,
                createdOn: aYearAgo
            });

            expect(subject.status).to.equal(OrderStatus.COMPLETED);
        })

    })
})
