import sinon from "sinon";
import request from "supertest";
import app from "../../../app";
import {getAuthenticatedApp} from "../../TestHelper";
import * as CartRepository from "../../../user/cart/CartRepository";
import {assert} from "chai";
import ItemRepository from "../../../item/ItemRepository";
import {ItemDAO} from "../../../item/ItemDAO";

describe('cart', () => {
    const loggedInUserEmail = "abc@enso.com";
    const authenticatedApp = getAuthenticatedApp(loggedInUserEmail);
    let getCartStub;
    let addToCartStub;
    let getItemByIdStub;

    beforeEach(() => {
        sinon.resetHistory();
        getCartStub = sinon.stub(CartRepository, 'getCart');
        addToCartStub = sinon.stub(CartRepository, 'addItemForUser');
        getItemByIdStub = sinon.stub(ItemRepository, 'getItemById');
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

            const itemId2 = "cde456";
            const itemTitle2 = "big dog";
            const ownerEmail2 = "snoopy@enso.com";
            const rentalDailyPrice2 = 12.23;
            const imageUrl2 = "abc-613.jpg";

            getCartStub.resolves([{itemId: itemId1}, {itemId: itemId2}]);

            getItemByIdStub.onCall(0).resolves(new ItemDAO({
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
            }));
            getItemByIdStub.onCall(1).resolves(new ItemDAO({
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
            }));

            const expectedOwnerBatch1 = [
                {
                    title: itemTitle1,
                    id: itemId1,
                    rentalDailyPrice: rentalDailyPrice1,
                    imageUrl: imageUrl1
                }
            ];

            const expectedOwnerBatch2 = [
                {
                    title: itemTitle2,
                    id: itemId2,
                    rentalDailyPrice: rentalDailyPrice2,
                    imageUrl: imageUrl2
                }
            ];

            request(authenticatedApp)
                .get('/api/cart')
                .expect(200, (error, response) => {
                    sinon.assert.calledWith(getItemByIdStub, itemId1);
                    sinon.assert.calledWith(getItemByIdStub, itemId2);
                    assert.deepEqual(response.body, {
                        [ownerEmail1]: expectedOwnerBatch1,
                        [ownerEmail2]: expectedOwnerBatch2
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
            request(authenticatedApp)
                .put('/api/cart')
                .send({itemId})
                .expect(200, (error, response) => {
                    sinon.assert.calledWith(addToCartStub, {itemId}, loggedInUserEmail);
                    done(error);
                })
        })
    })
});
