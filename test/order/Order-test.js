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
            "some-id",
            items
        );

        expect(subject.totalDeposits()).to.equal(10 * 2 + 3 * 4);
    })
})
