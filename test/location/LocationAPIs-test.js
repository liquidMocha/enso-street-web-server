import app from "../../src/app";
import request from "supertest";
import sinon from "sinon";
import UserRepository from "../../src/user/UserRepository";
import * as LocationRepository from "../../src/location/LocationRepository";
import {assert} from "chai";
import {getAuthenticatedApp} from "../TestHelper";
import {uuid} from "uuidv4";
import Location from "../../src/location/Location";

describe('location', () => {
    const url = '/api/locations';
    const location = {street: 'some street'};
    const locationId = 'asdfd-332nsdf-a';
    const loggedInUserId = uuid();
    let findOneUserStub;
    let getLocationForUserStub;
    let createLocationStub;
    let updateLocationStub;
    let getLocationByIdStub;

    const authenticatedApp = getAuthenticatedApp(loggedInUserId);

    beforeEach(() => {
        sinon.resetHistory();
        sinon.restore();
        findOneUserStub = sinon.stub(UserRepository, 'findOneUser').resolves({id: '123abc'});
        getLocationForUserStub = sinon.stub(LocationRepository, 'getLocationsForUser').resolves(location);
        createLocationStub = sinon.stub(LocationRepository, 'createLocation').resolves(locationId);
        updateLocationStub = sinon.stub(LocationRepository, 'updateLocation');
        getLocationByIdStub = sinon.stub(LocationRepository, 'getLocationById');
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

        it('should create location', (done) => {
            const street = "111 dunder st";
            const city = "Chicago";
            const state = "IL";
            const zipCode = "17271";
            const nickname = "office";
            request(authenticatedApp)
                .put(url)
                .send({
                    location: {
                        street: street,
                        city: city,
                        state: state,
                        zipCode: zipCode,
                        nickName: nickname
                    }
                })
                .expect(201, (error, response) => {
                    sinon.assert.calledWith(
                        createLocationStub,
                        sinon.match.instanceOf(Location),
                        loggedInUserId
                    );
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

        it('should update location', (done) => {
            const locationId = 'some-id';
            const updatedStreet = 'updated street';
            const updatedState = 'updated state';
            const updatedCity = 'updated city';
            const updatedZipCode = 'updated zipCode';
            const updatedNickname = 'updated nickname';
            const locationPayload = {
                location: {
                    id: locationId,
                    street: updatedStreet,
                    state: updatedState,
                    city: updatedCity,
                    zipCode: updatedZipCode,
                    nickname: updatedNickname
                }
            };

            const targetLocation = new Location(
                locationId,
                "some street",
                "Chicago",
                "IL",
                "18932",
                "home"
            )

            getLocationForUserStub.resolves([targetLocation])
            getLocationByIdStub.resolves({id: locationId})

            request(authenticatedApp)
                .put(url + '/' + locationId)
                .send(locationPayload)
                .expect(200, (error, response) => {
                    sinon.assert.calledWith(getLocationForUserStub, loggedInUserId);
                    sinon.assert.calledWith(updateLocationStub, new Location(
                        locationId,
                        updatedStreet,
                        updatedCity,
                        updatedState,
                        updatedZipCode,
                        updatedNickname
                    ))
                    done(error);
                })
        })

    });
});
