import {expect} from "chai";
import {reconstitueFromDao} from "../../../src/cart/CartFactory";
import {CartItemDao} from "../../../src/cart/CartItemDao";

describe('CartFactory', () => {
    it('should return cart based on cart items from DAO', () => {
        const id1 = "some id1";
        const id2 = "some id2";
        const id3 = "some id3";
        const owner1 = "some owner1";
        const owner2 = "some owner2";

        const actual = reconstitueFromDao(
            [
                new CartItemDao(id1, 1, owner1),
                new CartItemDao(id2, 2, owner2),
                new CartItemDao(id3, 3, owner1)
            ]
        );

        expect(actual.ownerBatches).to.have.property('length', 2);
        expect(actual.ownerBatches[0].cartItems).to.have.property('length', 2);
        expect(actual.ownerBatches[0].cartItems[0]).to.have.property('id', id1);
        expect(actual.ownerBatches[0].cartItems[0]).to.have.property('quantity', 1);
        expect(actual.ownerBatches[0].cartItems[1]).to.have.property('id', id3);
        expect(actual.ownerBatches[0].cartItems[1]).to.have.property('quantity', 3);

        expect(actual.ownerBatches[1].cartItems).to.have.property('length', 1);
        expect(actual.ownerBatches[1].cartItems[0]).to.have.property('id', id2);
        expect(actual.ownerBatches[1].cartItems[0]).to.have.property('quantity', 2);
    });
});
