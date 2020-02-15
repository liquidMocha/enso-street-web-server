import sinon from "sinon";
import request from "supertest";
import app from "../../../app";
import {getAuthenticatedApp} from "../../TestHelper";
import * as CartRepository from "../../../user/cart/CartRepository";
import {assert} from "chai";

describe('cart', () => {
    const authenticatedApp = getAuthenticatedApp();
    let getCartStub;
    const cart = [{itemId: "abc123"}];

    beforeEach(() => {
        sinon.resetHistory();
        getCartStub = sinon.stub(CartRepository, 'getCart').resolves(cart);
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
});
