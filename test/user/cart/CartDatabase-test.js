import {expect} from "chai";
import {setupItem, setupUser} from "../../TestHelper";
import {getCartItemsFor, update} from '../../../src/cart/CartRepository';
import uuidv4 from 'uuid/v4';
import database from "../../../src/database.js";
import {CartItemDao} from "../../../src/cart/CartItemDao";

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
            const cart = [
                new CartItemDao(itemId1, 5, 'some owner'),
                new CartItemDao(itemId2, 3, 'some owner')
            ];

            await update(userId, cart);

            const updatedCart = await getCartItemsFor(userId);
            expect(updatedCart.ownerBatches).to.have.property('length', 1);
            expect(updatedCart.ownerBatches[0].cartItems).to.have.property('length', 2);
            expect(updatedCart.ownerBatches[0].cartItems[0]).to.have.property("id", itemId1);
            expect(updatedCart.ownerBatches[0].cartItems[0]).to.have.property("quantity", 5);
            expect(updatedCart.ownerBatches[0].cartItems[1]).to.have.property("id", itemId2);
            expect(updatedCart.ownerBatches[0].cartItems[1]).to.have.property("quantity", 3);
        });


        it('should remove items with zero quantity', async () => {
            await update(userId, [new CartItemDao(itemId1, 5, 'some owner')]);

            const cartUpdate = [
                new CartItemDao(itemId1, 0, 'some owner'),
                new CartItemDao(itemId2, 3, 'some owner'),
            ];

            await update(userId, cartUpdate);

            const updatedCart = await getCartItemsFor(userId);
            expect(updatedCart.ownerBatches).to.have.property('length', 1);
            expect(updatedCart.ownerBatches[0].cartItems).to.have.property('length', 1);
            expect(updatedCart.ownerBatches[0].cartItems[0]).to.have.property("id", itemId2);
            expect(updatedCart.ownerBatches[0].cartItems[0]).to.have.property("quantity", 3);
        });
    });

    describe('get cart', () => {
        it('should retrieve cart for user', async () => {
            const cartUpdate = [new CartItemDao(itemId1, 1, 'some owner'),];
            await update(userId, cartUpdate);

            const cart = await getCartItemsFor(userId);

            expect(cart.ownerBatches).to.have.property('length', 1);
            expect(cart.ownerBatches[0].cartItems).to.have.property('length', 1);
            expect(cart.ownerBatches[0].cartItems[0]).to.have.property("id", itemId1);
            expect(cart.ownerBatches[0].cartItems[0]).to.have.property("quantity", 1);
        });
    });
});
