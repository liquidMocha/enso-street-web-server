import request from "supertest";
import UserRepository from "../../src/user/UserRepository";
import * as UserProfileRepository from "../../src/userprofile/UserProfileRepository";
import app from "../../src/app";
import sinon from 'sinon';
import bcrypt from "bcrypt";
import {User} from "../../src/user/User";
import express from "express";
import {assert} from "chai";
import {getAuthenticatedApp} from "../TestHelper";

describe('users', () => {
    let saveEnsoUserStub,
        findUserStub,
        bcryptStub,
        userUpdateStub,
        saveUserProfileStub,
        emailExistsStub,
        getPasswordForUserStub,
        userExistsStub;

    before(() => {
        saveEnsoUserStub = sinon.stub(UserRepository, 'saveEnsoUser');
        findUserStub = sinon.stub(UserRepository, 'findOneUser');
        userUpdateStub = sinon.stub(UserRepository, 'update');
        saveUserProfileStub = sinon.stub(UserProfileRepository, 'save');
        emailExistsStub = sinon.stub(UserRepository, 'emailExists');
        getPasswordForUserStub = sinon.stub(UserRepository, 'getPasswordForUser');
        userExistsStub = sinon.stub(UserRepository, 'userExists');
        bcryptStub = sinon.stub(bcrypt);
    });

    beforeEach(() => {
        sinon.resetHistory();
    });

    after(() => {
        sinon.restore();
    });

    describe('create user', () => {
        let userDto;

        beforeEach(() => {
            userDto = {
                email: 'user@email.com',
                name: 'Robert Dunder',
                password: '12345678'
            };
        });

        it('should return 201 if successfully created user', (done) => {
            saveEnsoUserStub.resolves();
            emailExistsStub.resolves(false)

            request(app)
                .post('/api/users/createUser')
                .send(userDto)
                .expect(201, (error) => {
                    sinon.assert.calledWith(saveEnsoUserStub, sinon.match.has("email", userDto.email), userDto.password);
                    sinon.assert.calledWith(saveEnsoUserStub, sinon.match.has("_failedAttempts", 0));
                    sinon.assert.calledWith(saveUserProfileStub, sinon.match.has("name", userDto.name));

                    if (error) {
                        return done(error);
                    }

                    done();
                });
        });

        it('should return 409 and not creating user if user\'s email already exist', (done) => {
            saveEnsoUserStub.resolves();
            emailExistsStub.resolves(true)

            request(app)
                .post('/api/users/createUser')
                .send(userDto)
                .expect(409, (error) => {
                    sinon.assert.notCalled(saveEnsoUserStub);

                    if (error) {
                        return done(error);
                    }

                    done();
                });
        })

        describe('should sanitize input', () => {
            it('should not try to create user if password is less than minimum password length', (done) => {
                request(app)
                    .post('/api/users/createUser')
                    .send({password: 'a'})
                    .expect(500, (error) => {
                        sinon.assert.notCalled(saveEnsoUserStub);

                        done(error);
                    })
            })
        })
    });

    describe('enso login', () => {
        it('should return 200 when found user and password matches', (done) => {
            const expectedEmail = "some@email.org";

            const user = new User({id: "some-id"});
            findUserStub.resolves(user);
            getPasswordForUserStub.resolves('abc')
            bcryptStub.compare.resolves(true);

            request(app)
                .post('/api/users/login')
                .send({email: expectedEmail, password: 'somepass'})
                .expect(200, (error) => {
                    sinon.assert.calledWithExactly(findUserStub, {email: expectedEmail});
                    sinon.assert.calledWith(bcryptStub.compare, 'somepass', 'abc');
                    sinon.assert.calledWith(userUpdateStub, user);
                    if (error) {
                        return done(error);
                    }
                    done();
                })
        });

        it('should reset failed sign in attempts when login successful', (done) => {
            const expectedEmail = "some@email.org";
            userUpdateStub.resolves();
            findUserStub.resolves(new User({email: expectedEmail}));
            getPasswordForUserStub.resolves('abc')
            bcryptStub.compare.resolves(true);

            request(app)
                .post('/api/users/login')
                .send({email: expectedEmail, password: 'somepass'})
                .expect(200, (error) => {
                    sinon.assert.calledWithExactly(userUpdateStub, sinon.match({
                        email: expectedEmail,
                        failedAttempts: 0
                    }));

                    if (error) {
                        return done(error);
                    }
                    done();
                })
        });

        it('should return 401 when no user found', (done) => {
            const expectedEmail = 'some@email';
            findUserStub.resolves(null);

            request(app)
                .post('/api/users/login')
                .send({email: expectedEmail, password: 'somepass'})
                .expect(401, (error) => {
                    sinon.assert.calledWithExactly(findUserStub, {email: expectedEmail});
                    sinon.assert.notCalled(bcryptStub.compare);

                    if (error) {
                        return done(error);
                    }
                    done();
                })
        });

        it('should return 401 when user found but password unmatched', (done) => {
            const expectedEmail = 'some@email';
            findUserStub.resolves(new User({email: expectedEmail}));
            const existingPassword = 'password';
            getPasswordForUserStub.resolves(existingPassword)
            bcryptStub.compare.resolves(false);

            request(app)
                .post('/api/users/login')
                .send({email: expectedEmail, password: 'somepass'})
                .expect(401, (error) => {
                    sinon.assert.calledWithExactly(findUserStub, {email: expectedEmail});
                    sinon.assert.calledWithExactly(bcryptStub.compare, 'somepass', existingPassword);

                    if (error) {
                        return done(error);
                    }
                    done();
                })
        });

        it('should increment failed login attempts when password unmatched', (done) => {
            const expectedEmail = 'some@email.com';
            findUserStub.resolves(new User({email: expectedEmail, failedAttempts: 1}));
            getPasswordForUserStub.resolves('abc')
            bcryptStub.compare.resolves(false);

            request(app)
                .post('/api/users/login')
                .send({email: expectedEmail, password: 'somepass'})
                .expect(401, (error) => {
                    sinon.assert.calledWithExactly(userUpdateStub, sinon.match({
                        email: expectedEmail,
                        failedAttempts: 2
                    }));

                    done(error);
                })
        });
    });

    describe('is requester logged in', () => {
        it('should return true if user has cookie and exists', (done) => {
            const userId = '123-3nskf';

            userExistsStub.resolves(true);

            const testApp = getAuthenticatedApp(userId);

            request(testApp)
                .post('/api/users/isLoggedIn')
                .expect(200, (error, response) => {
                    sinon.assert.calledWithExactly(userExistsStub, userId);
                    assert.equal(true, response.body.loggedIn);
                    done(error);
                });
        });

        it('should return false if user has cookie but no longer exists', (done) => {
            userExistsStub.resolves(false);
            const email = 'some@loggedin.email';

            const testApp = getAuthenticatedApp(email);

            request(testApp)
                .post('/api/users/isLoggedIn')
                .expect(200, (error, response) => {
                    assert.equal(false, response.body.loggedIn);
                    done(error);
                });
        });

        it('should return false if user is not logged in', (done) => {
            const testApp = express();
            testApp.use((req, res, next) => {
                req.session = {};
                next();
            });

            testApp.use(app);

            request(testApp)
                .post('/api/users/isLoggedIn')
                .expect(200, (error, response) => {
                    assert.equal(false, response.body.loggedIn);
                    sinon.assert.notCalled(findUserStub);
                    done(error);
                });
        })

    })
});
