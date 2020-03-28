import request from "supertest";
import UserRepository from "../../user/UserRepository";
import app from "../../app";
import sinon from 'sinon';
import bcrypt from "bcrypt";
import {User} from "../../user/User";
import express from "express";
import {assert} from "chai";

describe('users', () => {
    let createUserStub,
        createUserStub1,
        findUserStub,
        bcryptStub,
        incrementFailedAttemptStub,
        resetFailedAttemptStub;

    before(() => {
        createUserStub = sinon.stub(UserRepository, 'createEnsoUser');
        createUserStub1 = sinon.stub(UserRepository, 'createEnsoUser1');
        findUserStub = sinon.stub(UserRepository, 'findOne');
        incrementFailedAttemptStub = sinon.stub(UserRepository, 'incrementFailedAttempt');
        resetFailedAttemptStub = sinon.stub(UserRepository, 'resetFailedAttempts');
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
            createUserStub1.resolves();

            request(app)
                .post('/api/users/createUser')
                .send(userDto)
                .expect(201, (error) => {
                    sinon.assert.calledWith(createUserStub1, sinon.match.has("password", userDto.password));
                    sinon.assert.calledWith(createUserStub1, sinon.match.has("email", userDto.email));
                    sinon.assert.calledWith(createUserStub1, sinon.match({profile: {name: userDto.name}}));
                    if (error) {
                        return done(error);
                    }

                    done();
                });
        });

        it('should return 500 if failed to create user', (done) => {
            createUserStub1.rejects();

            request(app)
                .post('/api/users/createUser')
                .send(userDto)
                .expect(500, (error) => {
                    sinon.assert.calledWith(createUserStub1, sinon.match.has("password", userDto.password));
                    sinon.assert.calledWith(createUserStub1, sinon.match.has("email", userDto.email));
                    sinon.assert.calledWith(createUserStub1, sinon.match({profile: {name: userDto.name}}));

                    done(error);
                });
        });

        describe('should sanitize input', () => {
            it('should not try to create user if password is less than minimum password length', (done) => {
                request(app)
                    .post('/api/users/createUser')
                    .send({password: 'a'})
                    .expect(500, (error) => {
                        sinon.assert.notCalled(createUserStub);

                        done(error);
                    })
            })
        })
    });

    describe('enso login', () => {
        it('should return 200 when found user and password matches', (done) => {
            const expectedEmail = "some@email.org";

            findUserStub.resolves(new User({password: 'abc'}));
            bcryptStub.compare.resolves(true);

            request(app)
                .post('/api/users/login')
                .send({email: expectedEmail, password: 'somepass'})
                .expect(200, (error) => {
                    sinon.assert.calledWithExactly(findUserStub, {email: expectedEmail});
                    sinon.assert.calledWithExactly(bcryptStub.compare, 'somepass', 'abc');

                    if (error) {
                        return done(error);
                    }
                    done();
                })
        });

        it('should reset failed sign in attempts when login successful', (done) => {
            const expectedEmail = "some@email.org";

            findUserStub.resolves(new User({email: expectedEmail, password: 'abc'}));
            bcryptStub.compare.resolves(true);

            request(app)
                .post('/api/users/login')
                .send({email: expectedEmail, password: 'somepass'})
                .expect(200, (error) => {
                    sinon.assert.calledWithExactly(resetFailedAttemptStub, expectedEmail);

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
            findUserStub.resolves(new User({email: expectedEmail, password: 'password'}));
            bcryptStub.compare.resolves(false);

            request(app)
                .post('/api/users/login')
                .send({email: expectedEmail, password: 'somepass'})
                .expect(401, (error) => {
                    sinon.assert.calledWithExactly(findUserStub, {email: expectedEmail});
                    sinon.assert.calledWithExactly(bcryptStub.compare, 'somepass', 'password');

                    if (error) {
                        return done(error);
                    }
                    done();
                })
        });

        it('should increment failed login attempts when password unmatched', (done) => {
            const expectedEmail = 'some@email.com';
            findUserStub.resolves(new User({email: expectedEmail, password: 'password'}));
            bcryptStub.compare.resolves(false);

            request(app)
                .post('/api/users/login')
                .send({email: expectedEmail, password: 'somepass'})
                .expect(401, (error) => {
                    sinon.assert.calledWithExactly(incrementFailedAttemptStub, expectedEmail);

                    done(error);
                })
        });
    });

    describe('is requester logged in', () => {
        it('should return true if user is logged in', (done) => {
            const email = 'some@loggedin.email';

            const testApp = express();
            testApp.use((req, res, next) => {
                req.session = {email: email};
                next();
            });

            testApp.use(app);

            request(testApp)
                .post('/api/users/isLoggedIn')
                .expect(200, (error, response) => {
                    assert.equal(true, response.body.loggedIn);
                    return done(error);
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
                    return done(error);
                });
        })

    })
});
