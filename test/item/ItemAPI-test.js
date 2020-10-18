import {assert} from "chai";
import app from "../../src/app";
import {uuid} from "uuidv4";
import request from "supertest";
import sinon from "sinon";
import * as ItemRepository from "../../src/item/ItemRepository";
import * as HereApiClient from "../../src/location/HereApiClient";
import {getAuthenticatedApp} from "../TestHelper";
import {Item} from "../../src/item/Item";
import BorrowerItem from "../../src/item/BorrowerItem";
import {Coordinates} from "../../src/location/Coordinates";
import ItemLocation from "../../src/item/ItemLocation";
import UserRepository from "../../src/user/UserRepository";
import {User} from "../../src/user/User";
import {Owner} from "../../src/item/Owner";
import * as UserProfileRepository from "../../src/userprofile/UserProfileRepository";
import {getUserProfileByUserId} from "../../src/userprofile/UserProfileRepository";
import {UserProfile} from "../../src/userprofile/UserProfile";

describe('item API', () => {
    describe('create new item', () => {
        let saveItemStub,
            geocodeStub,
            getItemsForUserStub,
            getItemByIdStub,
            updateItemStub,
            getUserStub,
            findOneUserStub,
            getUserProfileByUserIdStub;
        const loggedInUser = 'j1i4o13-n314in-234nkjn';

        const authenticatedApp = getAuthenticatedApp(loggedInUser);
        before(() => {
            saveItemStub = sinon.stub(ItemRepository, 'save')
                .resolves('signed-request');

            geocodeStub = sinon.stub(HereApiClient, 'geocode')
                .resolves({latitude: 12.34, longitude: 33.45});

            getItemsForUserStub = sinon.stub(ItemRepository, 'getItemsForUser');
            getItemByIdStub = sinon.stub(ItemRepository, 'getItemById');
            updateItemStub = sinon.stub(ItemRepository, 'update');
            getUserStub = sinon.stub(UserRepository, 'getUser');
            findOneUserStub = sinon.stub(UserRepository, 'findOneUser');
            getUserProfileByUserIdStub = sinon.stub(UserProfileRepository, 'getUserProfileByUserId');
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
                const street = '1725 Slough Avenue';
                const city = 'scranton';
                const state = 'PA';
                const zipCode = '17870';
                const item = {
                    title: 'item title',
                    rentalDailyPrice: 20.61,
                    deposit: 60.12,
                    condition: 'like-new',
                    categories: ['games-and-toys'],
                    description: 'this is a test item',
                    canBeDelivered: true,
                    deliveryStarting: 2.29,
                    deliveryAdditional: 0.69,
                    location: {
                        address: {
                            street: street,
                            city: city,
                            state: state,
                            zipCode: zipCode
                        }
                    }
                };

                getUserStub.resolves({name: "", email: ""})
                const userId = "123-abc";
                const userEmail = "user@ensost.com";
                const owner = new User({id: userId, email: userEmail});
                findOneUserStub.resolves(owner);

                const userAlias = "user alias";
                const userProfile = new UserProfile({name: userAlias});
                getUserProfileByUserIdStub.resolves(userProfile);

                request(authenticatedApp)
                    .post('/api/items')
                    .send(item)
                    .expect(201, (error, response) => {
                        sinon.assert.calledWith(geocodeStub, sinon.match({
                            street, city, state, zipCode
                        }));
                        sinon.assert.calledWithMatch(saveItemStub, sinon.match({
                            ...item, owner: new Owner(owner.id, owner.email, userAlias)
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
                const title = "smelly cat";
                const description = "not favourite cat";
                const ownerId = uuid();
                const ownerEmail = "abc@phalange";
                const ownerAlias = "some body"
                const deposit = 2.1;
                const rentalDailyPrice = 5.2;
                const deliveryAdditional = 1.2;
                const deliveryStarting = 2.3;
                const condition = 'like-new';
                const imageUrl = '1doga.com';
                const canBeDelivered = true;
                const location = new ItemLocation(null, new Coordinates(12, 23));
                const createdOn = new Date();

                const item = new Item({
                    id: itemId,
                    title: title,
                    description: description,
                    owner: new Owner(ownerId, ownerEmail, ownerAlias),
                    deposit: deposit,
                    rentalDailyPrice: rentalDailyPrice,
                    deliveryAdditional: deliveryAdditional,
                    deliveryStarting: deliveryStarting,
                    condition: condition,
                    imageUrl: imageUrl,
                    canBeDelivered: canBeDelivered,
                    location: location,
                    createdOn: createdOn
                });
                getItemByIdStub.resolves(item);
                const expectedBorrowerItem = new BorrowerItem({
                    itemId: itemId,
                    title: title,
                    description: description,
                    ownerEmail: ownerEmail,
                    ownerAlias: ownerAlias,
                    deposit: deposit,
                    rentalDailyPrice: rentalDailyPrice,
                    deliveryAdditional: deliveryAdditional,
                    deliveryStarting: deliveryStarting,
                    condition: condition,
                    imageUrl: imageUrl,
                    canBeDelivered: canBeDelivered,
                    coordinates: location.coordinates,
                    createdOn: createdOn.toISOString()
                })

                request(app)
                    .get(`/api/items/${itemId}`)
                    .expect(200, (error, response) => {
                        sinon.assert.calledWith(getItemByIdStub, itemId);
                        assert.deepEqual(response.body, expectedBorrowerItem);
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

                const itemToBeDeleted = new Item(
                    {id: itemId, ownerEmail: loggedInUser}
                );
                getItemsForUserStub.resolves([itemToBeDeleted]);

                request(authenticatedApp)
                    .delete(`/api/items/${itemId}`)
                    .expect(200, (error, response) => {

                        sinon.assert.calledWith(updateItemStub, itemToBeDeleted);
                        done(error);
                    })
            });

            it('should respond with 500 when user try to delete item that does not belong to them', (done) => {
                const itemId = "123-abc";
                const notLoggedInUser = "some@randome.user";
                getItemsForUserStub.resolves([new Item({id: 'not-item-id', ownerEmail: notLoggedInUser})]);

                request(authenticatedApp)
                    .delete(`/api/items/${itemId}`)
                    .expect(204, (error, response) => {
                        sinon.assert.notCalled(updateItemStub);
                        done(error);
                    })
            })
        });

    });
});
