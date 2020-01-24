import app from "../../app";
import request from "supertest";
import sinon from "sinon";
import express from "express";
import UserRepository from "../../user/UserRepository";
import LocationRepository from "../../location/LocationRepository";
import {assert} from "chai";

describe('location', () => {
    const location = {street: 'some street'};
    let findOneUserStub;
    let getLocationForUserStub;

    beforeEach(() => {
        sinon.resetHistory();
        sinon.restore();
        findOneUserStub = sinon.stub(UserRepository, 'findOne')
            .returns(new Promise(((resolve, reject) => {
                resolve({id: '123abc'});
            })));
        getLocationForUserStub = sinon.stub(LocationRepository, 'getLocationsForUser')
            .returns(new Promise(((resolve, reject) => {
                resolve(location);
            })));
    });

    after(() => {
        sinon.restore();
    });

    describe('get all locations for user', (done) => {
        const url = '/api/locations';
        it('should bounce the user if come in without a cookie', (done) => {
            request(app)
                .get(url)
                .expect(401, (error) => {
                    return done(error);
                })
        });

        it('should return 404 if the logged in user is not found', (done) => {
            UserRepository.findOne.restore();
            findOneUserStub = sinon.stub(UserRepository, 'findOne')
                .returns(new Promise(((resolve, reject) => {
                    resolve(null);
                })));
            const testApp = express();
            const email = 'someemail';

            testApp.use((req, res, next) => {
                req.session = {email: email};
                next();
            });

            testApp.use(app);

            request(testApp)
                .get(url)
                .expect(404)
                .end((error) => {
                    done(error);
                });
        });

        it('should return locations', (done) => {
            const testApp = express();
            const email = 'someemail';

            testApp.use((req, res, next) => {
                req.session = {email: email};
                next();
            });

            testApp.use(app);

            request(testApp)
                .get(url)
                .expect(200, (error, response) => {
                    assert.deepEqual(response.body, location);
                    done(error);
                })
        })
    })
});