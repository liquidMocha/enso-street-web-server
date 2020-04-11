import app from "../../src/app";
import request from "supertest";
import sinon from "sinon";
import UserRepository from "../../src/user/UserRepository";
import * as LocationRepository from "../../src/location/LocationRepository";
import {assert} from "chai";
import {getAuthenticatedApp} from "../TestHelper";

describe('location', () => {
    const url = '/api/locations';
    const location = {street: 'some street'};
    const locationId = 'asdfd-332nsdf-a';
    let findOneUserStub;
    let getLocationForUserStub;
    let createLocationStub;
    let updateLocationStub;

    const authenticatedApp = getAuthenticatedApp();

    beforeEach(() => {
        sinon.resetHistory();
        sinon.restore();
        findOneUserStub = sinon.stub(UserRepository, 'findOne').resolves({id: '123abc'});
        getLocationForUserStub = sinon.stub(LocationRepository, 'getLocationsForUser').resolves(location);
        createLocationStub = sinon.stub(LocationRepository, 'createLocation').resolves(locationId);
        updateLocationStub = sinon.stub(LocationRepository, 'updateLocation');
    });

    after(() => {
        sinon.restore();
    });

    describe('get all locations for user', (done) => {
        it('should bounce the user if come in without a cookie', (done) => {
            request(app)
                .get(url)
                .expect(401, (error) => {
                    return done(error);
                })
        });

        it('should return 404 if the logged in user is not found', (done) => {
            UserRepository.findOne.restore();
            findOneUserStub = sinon.stub(UserRepository, 'findOne').resolves(null);

            request(authenticatedApp)
                .get(url)
                .expect(404)
                .end((error) => {
                    done(error);
                });
        });

        it('should return locations', (done) => {
            request(authenticatedApp)
                .get(url)
                .expect(200, (error, response) => {
                    assert.deepEqual(response.body, location);
                    done(error);
                })
        })
    });

    describe('create location', (done) => {
        it('should bounce the user if come in without a session', (done) => {
            request(app)
                .put(url)
                .expect(401, (error) => {
                    return done(error);
                })
        });

        it('should return 404 if the logged in user is not found', (done) => {
            UserRepository.findOne.restore();
            findOneUserStub = sinon.stub(UserRepository, 'findOne').resolves(null);

            request(authenticatedApp)
                .put(url)
                .expect(404)
                .end((error) => {
                    done(error);
                });
        });

        it('should create location', (done) => {
            request(authenticatedApp)
                .put(url)
                .expect(201, (error, response) => {
                    assert.deepEqual(response.body, locationId);
                    done(error);
                })
        })
    });

    describe('update location', (done) => {
        it('should bounce the user if come in without a session', (done) => {
            request(app)
                .put(url + '/' + locationId)
                .expect(401, (error) => {
                    return done(error);
                })
        });

        it('should return 404 if the logged in user is not found', (done) => {
            UserRepository.findOne.restore();
            findOneUserStub = sinon.stub(UserRepository, 'findOne')
                .resolves(null);

            request(authenticatedApp)
                .put(url + '/' + locationId)
                .expect(401)
                .end((error) => {
                    done(error);
                });
        });

        it('should update location', (done) => {
            const locationPayload = {location: {id: 'some-id'}};

            UserRepository.findOne.restore();
            findOneUserStub = sinon.stub(UserRepository, 'findOne').resolves({id: '123abc'});

            const updatedLocation = {street: 'some street'};
            updateLocationStub.resolves(updatedLocation);

            request(authenticatedApp)
                .put(url + '/' + locationId)
                .send(locationPayload)
                .expect(200, (error, response) => {
                    assert.deepEqual(response.body, updatedLocation);
                    done(error);
                })
        })

    });
});
