import {Order} from "../../src/order/Order";
import {OrderLineItem} from "../../src/transaction/OrderLineItem";
import {OrderItem} from "../../src/transaction/OrderItem";
import {expect} from 'chai';

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
        const lineItems = [
            lineItem1,
            lineItem2
        ]
        const startTime = new Date('May 9, 1975 16:00:00 GMT-3:00');
        const returnTime = new Date('May 11, 1975 16:00:00 GMT-3:00');

        const subject = new Order({orderItems: lineItems, startTime: startTime, returnTime: returnTime});

        expect(subject.itemSubtotal).to.equal(
            3 * (
                lineItem1.orderItem.rentalDailyPrice * lineItem1.quantity
                + lineItem2.orderItem.rentalDailyPrice * lineItem2.quantity
            )
        )
    })
})
