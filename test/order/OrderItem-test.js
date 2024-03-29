import {DELIVERY_STARTING_DISTANCE_IN_MILES} from "../../src/Constants";
import {expect} from "chai";
import {OrderItem} from "../../src/transaction/OrderItem";

describe('calculates delivery fee', () => {
    const deliveryStarting = 10;
    const deliveryAdditional = 2;
    const subject = new OrderItem({
        deliveryStarting: deliveryStarting,
        deliveryAdditional: deliveryAdditional
    });

    it('uses delivery starting if distance is less than or equal to configured starting distance', () => {
        const actual = subject.getDeliveryFee(DELIVERY_STARTING_DISTANCE_IN_MILES);

        expect(actual).to.equal(deliveryStarting);
    });

    it('adds delivery additional fees if distance is larger than starting distance', () => {
        const actual = subject.getDeliveryFee(DELIVERY_STARTING_DISTANCE_IN_MILES + 2);

        expect(actual).to.equal(14);
    });

    it('rounds UP distance', () => {
        const actual = subject.getDeliveryFee(DELIVERY_STARTING_DISTANCE_IN_MILES + 2.2);

        expect(actual).to.equal(16);
    });
})
