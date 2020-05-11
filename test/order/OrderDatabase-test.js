import chai, {expect} from 'chai';
import {uuid} from "uuidv4";
import {Order} from "../../src/order/Order";
import {OrderItem} from "../../src/transaction/OrderItem";
import {setupItem, setupUser} from "../TestHelper";
import {OrderStatus} from "../../src/order/OrderStatus";
import {Owner} from "../../src/item/Owner";
import {OrderLineItem} from "../../src/transaction/OrderLineItem";
import ItemLocation from "../../src/item/ItemLocation";
import Address from "../../src/location/Address";
import {Coordinates} from "../../src/location/Coordinates";
import sinon from "sinon";
import Index from "../../src/search/Index";
import {Renter} from "../../src/order/Renter";
import {sameProcessOrderRepository} from "../../src/ApplicationContext";

chai.use(require('chai-datetime'));

describe('order database', () => {
    const subject = sameProcessOrderRepository;

    before(() => {
        sinon.stub(Index);
    });

    after(() => {
        sinon.restore();
    });

    it('should retrieve order by payment intent ID', async () => {
        const paymentIntentId = "some_pi_id";
        const itemId = uuid();
        const orderItems = [
            new OrderLineItem(
                new OrderItem({
                    itemId: itemId,
                    condition: "like-new",
                    location: new ItemLocation(
                        new Address({
                            street: "",
                            city: "",
                            state: "",
                            zipCode: ""
                        }),
                        new Coordinates(10, 12)
                    )
                }),
                1
            )
        ];

        const orderId = uuid();
        const startTime = new Date();
        const returnTime = new Date();
        await givenAnOrderWith(paymentIntentId, orderItems, orderId, startTime, returnTime, itemId);


        const actual = (await subject.getByPaymentIntentId(paymentIntentId));


        expect(actual.id).to.equal(orderId);
        expect(actual.paymentIntentId).to.equal(paymentIntentId);
        expect(actual.startTime).to.equalTime(startTime);
        expect(actual.returnTime).to.equalTime(returnTime);
        expect(actual.status).to.equal(OrderStatus.FUND_NOT_AUTHORIZED);
        expect(actual.orderLineItems.length).to.equal(1);
        expect(actual.orderLineItems[0].orderItem.itemId).to.equal(orderItems[0].orderItem.itemId);
        expect(actual.orderLineItems[0].orderItem.location.coordinates).to.deep.equal(orderItems[0].orderItem.location.coordinates);
        expect(actual.orderLineItems[0].quantity).to.equal(1);
    })

    async function givenAnOrderWith(paymentIntentId, orderItems, orderId, startTime, returnTime, itemId) {
        const userId = uuid();
        const userEmail = "abc@ensost.com";
        await setupItem({itemId: itemId, userId: userId, userEmail: userEmail});

        const renterId = uuid();
        await setupUser({
            id: renterId, email: "some-email@enso"
        });
        const order = new Order(
            {
                id: orderId,
                orderItems: orderItems,
                paymentIntentId: paymentIntentId,
                startTime: startTime,
                returnTime: returnTime,
                executor: new Owner(userId, userEmail),
                renter: new Renter(renterId, "John Doe", true)
            }
        );

        await subject.save(order);
        return {paymentIntentId, orderItems, orderId, startTime, returnTime};
    }
})
