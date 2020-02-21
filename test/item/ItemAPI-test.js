import {assert} from "chai";
import app from "../../app";
import request from "supertest";
import sinon from "sinon";
import * as ItemRepository from "../../item/ItemRepository";
import * as HereApiClient from "../../location/HereApiClient";
import {getAuthenticatedApp} from "../TestHelper";
import {ItemDAO} from "../../item/ItemDAO";

describe('item API', () => {
    describe('create new item', () => {
        let saveItemStub;
        let geocodeStub;
        let getItemsForUserStub;
        let getItemByIdStub;
        let deleteItemStub;
        const loggedInUser = 'mschoot@dundler.com';

        const authenticatedApp = getAuthenticatedApp(loggedInUser);
        before(() => {
            saveItemStub = sinon.stub(ItemRepository, 'save')
                .resolves('signed-request');

            geocodeStub = sinon.stub(HereApiClient, 'geocode')
                .resolves({latitude: 12.34, longitude: 33.45});

            getItemsForUserStub = sinon.stub(ItemRepository, 'getItemsForUser');
            getItemByIdStub = sinon.stub(ItemRepository, 'getItemById');
            deleteItemStub = sinon.stub(ItemRepository, 'archive');
        });

        beforeEach(() => {
            sinon.resetHistory();
        });

        after(() => {
            sinon.restore();
        });

        describe('save new item', () => {
            it('should respond with 401 when user is not authenticated', (done) => {
                request(app)
                    .post('/api/items')
                    .expect(401, (error) => {
                        return done(error);
                    })
            });

            it('should save item', (done) => {
                const item = {
                    title: 'item title',
                    rentalDailyPrice: 20.61,
                    deposit: 60.12,
                    condition: 'like-new',
                    categories: 'games-and-toys',
                    description: 'this is a test item',
                    canBeDelivered: true,
                    deliveryStarting: 2.29,
                    deliveryAdditional: 0.69,
                    location: {
                        street: '1725 Slough Avenue',
                        city: 'scranton',
                        state: 'PA',
                        zipCode: 17870
                    }
                };

                request(authenticatedApp)
                    .post('/api/items')
                    .send(item)
                    .expect(201, (error, response) => {
                        sinon.assert.calledWith(geocodeStub, '1725 Slough Avenue, scranton, PA, 17870');
                        sinon.assert.calledWithMatch(saveItemStub, sinon.match({
                            ...item
                        }));
                        done(error);
                    });
            })
        });

        describe('get all items of user', () => {
            it('should respond with 401 when user is not authenticated', (done) => {
                request(app)
                    .get('/api/items')
                    .expect(401, (error) => {
                        return done(error);
                    })
            });

            it('should return items of logged in user', (done) => {
                const items = [{title: 'small cat'}];
                getItemsForUserStub.resolves(items);

                request(authenticatedApp)
                    .get('/api/items')
                    .expect(200, (error, response) => {
                        sinon.assert.calledWith(getItemsForUserStub, loggedInUser);
                        assert.deepEqual(response.body, items);
                        done(error);
                    })
            });

            it('should respond with 500 when errors', (done) => {
                getItemsForUserStub.throws();

                request(authenticatedApp)
                    .get('/api/items')
                    .expect(500, (error, response) => {
                        sinon.assert.calledWith(getItemsForUserStub, loggedInUser);
                        done(error);
                    })
            })
        });

        describe('get item by ID', () => {
            it('should return item of given ID', (done) => {
                const itemId = "abc-123";
                const item = {title: 'small cat'};
                getItemByIdStub.resolves(item);

                request(app)
                    .get(`/api/items/${itemId}`)
                    .expect(200, (error, response) => {
                        sinon.assert.calledWith(getItemByIdStub, itemId);
                        assert.deepEqual(response.body, item);
                        done(error);
                    })
            });

            it('should respond with 500 when errors', (done) => {
                getItemByIdStub.throws();

                request(app)
                    .get('/api/items/abc-cba')
                    .expect(500, (error, response) => {
                        done(error);
                    })
            })
        });

        describe('delete item', () => {
            it('should respond with 401 when user is not authenticated', (done) => {
                request(app)
                    .delete('/api/items/123456')
                    .expect(401, (error) => {
                        return done(error);
                    })
            });

            it('should archive item by ID', (done) => {
                const itemId = "74219fabc";

                getItemByIdStub.resolves(new ItemDAO({id: itemId, ownerEmail: loggedInUser}));

                request(authenticatedApp)
                    .delete(`/api/items/${itemId}`)
                    .expect(200, (error, response) => {

                        sinon.assert.calledWith(deleteItemStub, itemId);
                        done(error);
                    })
            });

            it('should respond with 500 when user try to delete item that does not belong to them', (done) => {
                const itemId = "123-abc";
                const notLoggedInUser = "some@randome.user";
                getItemByIdStub.resolves(new ItemDAO({id: itemId, ownerEmail: notLoggedInUser}));

                request(authenticatedApp)
                    .delete(`/api/items/${itemId}`)
                    .expect(500, (error, response) => {
                        sinon.assert.notCalled(deleteItemStub);
                        done(error);
                    })
            })
        });

    });
});
