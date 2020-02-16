import sinon from "sinon";
import request from "supertest";
import app from "../../../app";
import {getAuthenticatedApp} from "../../TestHelper";
import * as CartRepository from "../../../user/cart/CartRepository";
import {assert} from "chai";

describe('cart', () => {
    const loggedInUserEmail = "abc@enso.com";
    const authenticatedApp = getAuthenticatedApp(loggedInUserEmail);
    let getCartStub;
    let addToCartStub;
    const cart = [{itemId: "abc123"}];

    beforeEach(() => {
        sinon.resetHistory();
        getCartStub = sinon.stub(CartRepository, 'getCart').resolves(cart);
        addToCartStub = sinon.stub(CartRepository, 'addItemForUser')
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
            request(authenticatedApp)
                .get('/api/cart')
                .expect(200, (error, response) => {
                    assert.deepEqual(response.body, cart);
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
