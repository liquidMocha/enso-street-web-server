import {expect} from "chai";
import {setupItem, setupUser} from "../../TestHelper";
import {getCartItemsFor, update} from '../../../user/cart/CartRepository';
import uuidv4 from 'uuid/v4';
import database from "../../../database";
import {CartItem} from "../../../user/cart/CartItem";
import {Cart} from "../../../user/cart/Cart";

describe('cart database', () => {
    afterEach(async () => {
        await database.none('truncate public.user cascade;');
        await database.none('truncate public.user_profile cascade;');
        await database.none('truncate public.itemtocategory cascade;');
        await database.none('truncate public.item cascade;');
    });

    const email = "some@email.com";
    const name = "jon doe";
    let userId;
    let itemId1, itemId2;

    beforeEach(async () => {
        userId = await setupUser({email, name});

        itemId1 = uuidv4();
        itemId2 = uuidv4();
        await setupItem(itemId1);
        await setupItem(itemId2);
    });

    describe('update cart', () => {
        it('should update items with non-zero quantity', async () => {
            const cart = new Cart({
                cartItems:
                    [
                        new CartItem({itemId: itemId1, quantity: 5}),
                        new CartItem({itemId: itemId2, quantity: 3})
                    ]
            });

            await update(userId, cart);

            const updatedCart = await getCartItemsFor(userId);
            expect(updatedCart.items).to.have.property('length', 2);
            expect(updatedCart.items[0]).to.have.property("id", itemId1);
            expect(updatedCart.items[0]).to.have.property("quantity", 5);
            expect(updatedCart.items[1]).to.have.property("id", itemId2);
            expect(updatedCart.items[1]).to.have.property("quantity", 3);
        });


        it('should remove items with zero quantity', async () => {
            const originalCart = new Cart({
                cartItems: [
                    new CartItem({itemId: itemId1, quantity: 5})
                ]
            });

            await update(userId, originalCart);

            const cartUpdate = new Cart({
                cartItems: [
                    new CartItem({itemId: itemId1, quantity: 0}),
                    new CartItem({itemId: itemId2, quantity: 3})
                ]
            });
            await update(userId, cartUpdate);

            const updatedCart = await getCartItemsFor(userId);
            expect(updatedCart.items).to.have.property('length', 1);
            expect(updatedCart.items[0]).to.have.property("id", itemId2);
            expect(updatedCart.items[0]).to.have.property("quantity", 3);
        });
    });

    describe('get cart', () => {
        it('should retrieve cart for user', async () => {
            const cartUpdate = new Cart({
                cartItems: [
                    new CartItem({itemId: itemId1, quantity: 1}),
                ]
            });
            await update(userId, cartUpdate);

            const cart = await getCartItemsFor(userId);

            expect(cart.items).to.have.property('length', 1);
            expect(cart.items[0]).to.have.property("id", itemId1);
            expect(cart.items[0]).to.have.property("quantity", 1);
        });
    });
});
