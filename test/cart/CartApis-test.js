import sinon from "sinon";
import request from "supertest";
import app from "../../src/app";
import {getAuthenticatedApp} from "../TestHelper";
import * as CartRepository from "../../src/cart/CartRepository";
import {assert} from "chai";
import * as ItemRepository from "../../src/item/ItemRepository";
import UserRepository from "../../src/user/UserRepository";
import {CartItem} from "../../src/cart/domain/CartItem";
import {Cart} from "../../src/cart/domain/Cart";
import {CartOwnerBatch} from "../../src/cart/domain/CartOwnerBatch";
import {CartItemDao} from "../../src/cart/CartItemDao";
import {Item} from "../../src/item/Item";

describe('cart', () => {
    const loggedInUserId = "abcajsfd-123-143n1f";
    const authenticatedApp = getAuthenticatedApp(loggedInUserId);
    let updateCartStub;
    let getCartStub;
    let getItemByIdStub;
    let findOneUserStub;
    let getUserStub;
    let findOwnerForItemStub;

    beforeEach(() => {
        sinon.resetHistory();
        updateCartStub = sinon.stub(CartRepository, 'update');
        getCartStub = sinon.stub(CartRepository, 'getCartItemsFor');
        getItemByIdStub = sinon.stub(ItemRepository, 'getItemById');
        findOneUserStub = sinon.stub(UserRepository, 'findOneUser');
        getUserStub = sinon.stub(UserRepository, 'getUser');
        findOwnerForItemStub = sinon.stub(ItemRepository, 'findOwnerForItem');
    });

    afterEach(() => {
        sinon.restore();
    });

    describe('get cart for user', () => {
        it('should respond 401 when user is not authenticated', (done) => {
            request(app)
                .get('/api/cart')
                .expect(401, (error) => {
                    return done(error);
                })
        });

        it('should get cart for logged in user', (done) => {
            const itemId1 = "abc123";
            const itemTitle1 = "small cat";
            const ownerEmail1 = "abc@enso.com";
            const rentalDailyPrice1 = 12.23;
            const imageUrl1 = "abc-123.jpg";
            const ownerName1 = "Eleanor Shellstrop";
            const ownerId1 = "owner-id1";

            const itemId2 = "cde456";
            const itemTitle2 = "big dog";
            const ownerEmail2 = "snoopy@enso.com";
            const rentalDailyPrice2 = 12.23;
            const imageUrl2 = "abc-613.jpg";
            const ownerName2 = "Chidi Anagonye";
            const ownerId2 = "owner-id2";

            const fakeCart = new Cart([
                new CartOwnerBatch(ownerId1, new CartItem(itemId1, 1)),
                new CartOwnerBatch(ownerId2, new CartItem(itemId2, 2)),
            ]);

            getCartStub.resolves(fakeCart);

            getUserStub.onCall(0).resolves({name: ownerName1, email: ownerEmail1});
            getUserStub.onCall(1).resolves({name: ownerName2, email: ownerEmail2});

            getItemByIdStub.onCall(0).resolves(new Item(
                {
                    id: itemId1,
                    title: itemTitle1,
                    ownerEmail: ownerEmail1,
                    deposit: 123,
                    rentalDailyPrice: rentalDailyPrice1,
                    deliveryAdditional: 2,
                    deliveryStarting: 10,
                    condition: "Like new",
                    description: "something something something vicky",
                    imageUrl: imageUrl1
                }
            ));
            getItemByIdStub.onCall(1).resolves(new Item(
                {
                    id: itemId2,
                    title: itemTitle2,
                    ownerEmail: ownerEmail2,
                    deposit: 123,
                    rentalDailyPrice: rentalDailyPrice2,
                    deliveryAdditional: 2,
                    deliveryStarting: 10,
                    condition: "Like new",
                    description: "something something something vicky",
                    imageUrl: imageUrl2
                }
            ));

            const expectedOwnerBatch1 = [
                {
                    title: itemTitle1,
                    id: itemId1,
                    rentalDailyPrice: rentalDailyPrice1,
                    imageUrl: imageUrl1,
                    quantity: 1
                }
            ];

            const expectedOwnerBatch2 = [
                {
                    title: itemTitle2,
                    id: itemId2,
                    rentalDailyPrice: rentalDailyPrice2,
                    imageUrl: imageUrl2,
                    quantity: 2
                }
            ];

            request(authenticatedApp)
                .get('/api/cart')
                .expect(200, (error, response) => {
                    sinon.assert.calledWith(getCartStub, loggedInUserId);
                    sinon.assert.calledWith(getUserStub, ownerId1);
                    sinon.assert.calledWith(getUserStub, ownerId2);
                    assert.deepEqual(response.body, {
                        ownerBatches: [
                            {
                                ownerName: ownerName1,
                                ownerEmail: ownerEmail1,
                                items: expectedOwnerBatch1
                            },
                            {
                                ownerName: ownerName2,
                                ownerEmail: ownerEmail2,
                                items: expectedOwnerBatch2
                            }
                        ]
                    });
                    done(error);
                })
        })
    });

    describe('add item to cart', () => {
        it('should respond 401 when user is not authenticated', (done) => {
            const itemId = "abc-123";
            request(app)
                .put('/api/cart')
                .expect(401, (error, response) => {
                    done(error);
                })
        });

        it('should add item to cart for authenticated user', (done) => {
            const itemId = "abc-123";
            const itemId2 = "def-123";
            const ownerId = "owner-id";

            const existingCart = new Cart([
                new CartOwnerBatch("owner-id", new CartItem(itemId, 2))
            ]);
            getCartStub.resolves(existingCart);
            findOwnerForItemStub.resolves(ownerId);

            request(authenticatedApp)
                .put('/api/cart')
                .send({itemId: itemId2})
                .expect(200, (error, response) => {
                    sinon.assert.calledWith(
                        updateCartStub,
                        loggedInUserId,
                        sinon.match.some(
                            sinon.match(new CartItemDao(itemId2, 1, ownerId))
                        )
                            .and(sinon.match.some(
                                sinon.match(new CartItemDao(itemId, 2, ownerId)))
                            )
                    );
                    done(error);
                })
        });
    });

    describe('remove one for an item', () => {
        it('should respond 401 when user is not authenticated', (done) => {
            const itemId = "abc-123";
            request(app)
                .delete('/api/cart')
                .expect(401, (error, response) => {
                    done(error);
                })
        });

        it('should remove item from cart for user', (done) => {
            const itemId = "abc-123";
            const ownerId = "owner-id";
            const existingCart = new Cart([
                new CartOwnerBatch("owner-id", new CartItem(itemId, 2))
            ]);
            getCartStub.resolves(existingCart);
            findOwnerForItemStub.resolves(ownerId);

            request(authenticatedApp)
                .delete('/api/cart')
                .send({itemId: itemId})
                .expect(200, (error, response) => {
                    sinon.assert.calledWith(
                        updateCartStub,
                        loggedInUserId,
                        sinon.match.some(
                            sinon.match(new CartItemDao(itemId, 1, ownerId))
                        )
                    );
                    done(error);
                })
        });

        it('should remove all instances of an item from cart for user when delete all is true', (done) => {
            const itemId = "abc-123";
            const ownerId = "owner-id";

            const existingCart = new Cart([
                new CartOwnerBatch("owner-id", new CartItem(itemId, 2))
            ]);
            getCartStub.resolves(existingCart);
            findOwnerForItemStub.resolves(ownerId);

            request(authenticatedApp)
                .delete('/api/cart')
                .send({itemId: itemId, all: true})
                .expect(200, (error, response) => {
                    sinon.assert.calledWith(
                        updateCartStub,
                        loggedInUserId,
                        sinon.match.some(
                            sinon.match(new CartItemDao(itemId, 0, ownerId))
                        )
                    );
                    done(error);
                })
        });
    })
});
