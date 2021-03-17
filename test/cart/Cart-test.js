import {Cart} from "../../src/cart/domain/Cart";
import {expect} from 'chai';
import {CartItem} from "../../src/cart/domain/CartItem";
import {CartOwnerBatch} from "../../src/cart/domain/CartOwnerBatch";

describe('cart', () => {
    describe('add item', () => {
        it('should add item to cart when item does not exist in cart yet', () => {
            const itemId = "abc-123";
            const ownerId = "owner-id";
            const cart = new Cart([]);

            cart.addItem(itemId, ownerId);

            expect(cart.ownerBatches).to.have.property('length', 1);
            expect(cart.ownerBatches[0].cartItems).to.have.property('length', 1);
            expect(cart.ownerBatches[0].cartItems[0]).to.have.property("id", itemId);
            expect(cart.ownerBatches[0].cartItems[0]).to.have.property("quantity", 1);
        });

        it('should increment item count when item already exist in cart', () => {
            const itemId = 'abc-123';
            const ownerId = "owner-id";

            const cart = new Cart([
                new CartOwnerBatch(ownerId, [new CartItem(itemId, 1)])
            ]);

            cart.addItem(itemId, ownerId);

            expect(cart.ownerBatches).to.have.property('length', 1);
            expect(cart.ownerBatches[0].cartItems).to.have.property('length', 1);
            expect(cart.ownerBatches[0].cartItems[0]).to.have.property("id", itemId);
            expect(cart.ownerBatches[0].cartItems[0]).to.have.property("quantity", 2);
        })
    });

    describe('remove item', () => {
        it('should decrement item quantity by 1', () => {
            const itemId = "abc-123";
            const ownerId = "owner-id";
            const cart = new Cart([]);

            cart.addItem(itemId, ownerId);
            cart.addItem(itemId, ownerId);

            cart.removeItem(itemId, ownerId);

            expect(cart.ownerBatches).to.have.property('length', 1);
            expect(cart.ownerBatches[0].cartItems).to.have.property('length', 1);
            expect(cart.ownerBatches[0].cartItems[0]).to.have.property("quantity", 1);
        });

        it('should not decrement item quantity to lower than 0', () => {
            const itemId = "abc-123";
            const ownerId = "owner-id";
            const cart = new Cart([]);

            cart.addItem(itemId, ownerId);

            cart.removeItem(itemId, ownerId);
            cart.removeItem(itemId, ownerId);

            expect(cart.ownerBatches).to.have.property('length', 1);
            expect(cart.ownerBatches[0].cartItems).to.have.property('length', 1);
            expect(cart.ownerBatches[0].cartItems[0]).to.have.property("quantity", 0);
        })
    });

    describe('remove all instance of item', () => {
        it('should set quantity of the item to 0', () => {
            const itemId = "abc-123";
            const ownerId = "owner-id";
            const cart = new Cart([new CartOwnerBatch(ownerId, [new CartItem(itemId, 4)])]);

            cart.removeAllInstanceOfItem(itemId, ownerId);

            expect(cart.ownerBatches).to.have.property('length', 1);
            expect(cart.ownerBatches[0].cartItems).to.have.property('length', 1);
            expect(cart.ownerBatches[0].cartItems[0]).to.have.property("quantity", 0);
        })
    })
});
