import {expect} from "chai";
import {setupItem, setupUser} from "../TestHelper";
import {getCartItemsFor, update} from '../../src/cart/CartRepository';
import uuidv4 from 'uuid/v4';
import database from "../../src/database.js";
import {CartItemDao} from "../../src/cart/CartItemDao";
import sinon from "sinon";
import Index from "../../src/search/Index";

describe('cart database', () => {
    const email = "some@email.com";
    const name = "jon doe";
    let renterUserId;
    let itemId1, itemId2, itemId3;
    let userId1, userId2;
    let userEmail1, userEmail2;

    before(() => {
        sinon.stub(Index);
    });

    beforeEach(async () => {
        renterUserId = await setupUser({email, name});

        itemId1 = uuidv4();
        itemId2 = uuidv4();
        itemId3 = uuidv4();
        userId1 = uuidv4();
        userId2 = uuidv4();
        userEmail1 = uuidv4();
        userEmail2 = uuidv4();
        await setupItem({itemId: itemId1, userId: userId1, userEmail: userEmail1});
        await setupItem({itemId: itemId2, userId: userId2, userEmail: userEmail2});
        await setupItem({itemId: itemId3, userId: userId2, userEmail: userEmail2});
    });

    afterEach(async () => {
        await database.none('truncate public.user cascade;');
        await database.none('truncate public.user_profile cascade;');
        await database.none('truncate public.itemtocategory cascade;');
        await database.none('truncate public.item cascade;');
    });

    describe('update cart', () => {
        it('should update items with non-zero quantity', async () => {
            const cart = [
                new CartItemDao(itemId2, 3, 'some owner'),
                new CartItemDao(itemId3, 5, 'some owner')
            ];

            await update(renterUserId, cart);

            const updatedCart = await getCartItemsFor(renterUserId);
            expect(updatedCart.ownerBatches).to.have.property('length', 1);
            expect(updatedCart.ownerBatches[0].cartItems).to.have.property('length', 2);
            expect(updatedCart.ownerBatches[0].cartItems[0]).to.have.property("id", itemId2);
            expect(updatedCart.ownerBatches[0].cartItems[0]).to.have.property("quantity", 3);
            expect(updatedCart.ownerBatches[0].cartItems[1]).to.have.property("id", itemId3);
            expect(updatedCart.ownerBatches[0].cartItems[1]).to.have.property("quantity", 5);
        });


        it('should remove items with zero quantity', async () => {
            await update(renterUserId, [new CartItemDao(itemId1, 5, 'some owner')]);

            const cartUpdate = [
                new CartItemDao(itemId1, 0, 'some owner'),
                new CartItemDao(itemId2, 3, 'some owner'),
            ];

            await update(renterUserId, cartUpdate);

            const updatedCart = await getCartItemsFor(renterUserId);
            expect(updatedCart.ownerBatches).to.have.property('length', 1);
            expect(updatedCart.ownerBatches[0].cartItems).to.have.property('length', 1);
            expect(updatedCart.ownerBatches[0].cartItems[0]).to.have.property("id", itemId2);
            expect(updatedCart.ownerBatches[0].cartItems[0]).to.have.property("quantity", 3);
        });
    });

    describe('get cart', () => {
        it('should retrieve cart for user', async () => {
            const cartUpdate = [new CartItemDao(itemId1, 1, 'some owner'),];
            await update(renterUserId, cartUpdate);

            const cart = await getCartItemsFor(renterUserId);

            expect(cart.ownerBatches).to.have.property('length', 1);
            expect(cart.ownerBatches[0].cartItems).to.have.property('length', 1);
            expect(cart.ownerBatches[0].cartItems[0]).to.have.property("id", itemId1);
            expect(cart.ownerBatches[0].cartItems[0]).to.have.property("quantity", 1);
        });
    });
});
