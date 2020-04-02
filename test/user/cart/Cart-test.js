import {Cart} from "../../../user/cart/Cart";
import {expect} from 'chai';
import {CartItem} from "../../../user/cart/CartItem";

describe('cart', () => {
    describe('add item', () => {
        it('should add item to cart when item does not exist in cart yet', () => {
            const itemId = "abc-123";
            const cart = new Cart({cartItems: []});

            cart.addItem(itemId);

            expect(cart.items).to.have.property('length', 1);
            expect(cart.items[0]).to.have.property("id", itemId);
            expect(cart.items[0]).to.have.property("quantity", 1);
        });

        it('should increment item count when item already exist in cart', () => {
            const itemId = 'abc-123';
            const cart = new Cart({cartItems: [new CartItem({itemId, quantity: 1})]});

            cart.addItem(itemId);

            expect(cart.items).to.have.property('length', 1);
            expect(cart.items[0]).to.have.property("id", itemId);
            expect(cart.items[0]).to.have.property("quantity", 2);
        })
    });

    describe('remove item', () => {
        it('should decrement item quantity by 1', () => {
            const itemId = "abc-123";
            const cart = new Cart({cartItems: []});

            cart.addItem(itemId);
            cart.addItem(itemId);

            cart.removeItem(itemId);

            expect(cart.items).to.have.property('length', 1);
            expect(cart.items[0]).to.have.property("quantity", 1);
        });

        it('should not decrement item quantity to lower than 0', () => {
            const itemId = "abc-123";
            const cart = new Cart({cartItems: []});

            cart.addItem(itemId);

            cart.removeItem(itemId);
            cart.removeItem(itemId);

            expect(cart.items).to.have.property('length', 1);
            expect(cart.items[0]).to.have.property("quantity", 0);
        })
    });

    describe('remove all instance of item', () => {
        it('should set quantity of the item to 0', () => {
            const itemId = 'abc-123';
            const cart = new Cart({cartItems: [new CartItem({itemId, quantity: 4})]});

            cart.removeAllInstanceOfItem(itemId);

            expect(cart.items).to.have.property('length', 1);
            expect(cart.items[0]).to.have.property("id", itemId);
            expect(cart.items[0]).to.have.property("quantity", 0);
        })
    })
});
