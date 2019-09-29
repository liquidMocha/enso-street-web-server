import request from "supertest";
import UserService from "../user/UserService";
import app from "../app";
import sinon from 'sinon';
import bcrypt from "bcrypt";

// noinspection JSUnusedLocalSymbols
const UsersController = require('../routes/UsersController'); // This is necessary to show test coverage

describe('users', () => {
    let createUserStub, findUserStub, bcryptStub;

    before(() => {
        createUserStub = sinon.stub(UserService, 'createEnsoUser');
        findUserStub = sinon.stub(UserService, 'findOne');
        bcryptStub = sinon.stub(bcrypt);
    });

    beforeEach(() => {
        sinon.resetHistory();
    });

    after(() => {
        sinon.restore();
    });

    describe('create user', () => {
        let user;

        beforeEach(() => {
            user = {
                email: 'user@email.com',
                name: 'Robert Dunder',
                password: '12345678'
            };
        });

        it('should return a 201 if successfully created user', (done) => {
            createUserStub.resolves();

            request(app)
                .post('/users/createUser')
                .send(user)
                .expect(201, (error) => {
                    sinon.assert.calledWithExactly(createUserStub, user.name, user.password, user.email);
                    if (error) {
                        return done(error);
                    }

                    done();
                });
        });

        it('should return 500 if failed to create user', (done) => {
            createUserStub.rejects();

            request(app)
                .post('/users/createUser')
                .send(user)
                .expect(500, (error) => {
                    sinon.assert.calledWithExactly(createUserStub, user.name, user.password, user.email);

                    done(error);
                });
        });

        describe('should sanitize input', () => {
            it('should not try to create user if password is less than minimum password length', (done) => {
                request(app)
                    .post('/users/createUser')
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

            findUserStub.resolves({password: 'abc'});
            bcryptStub.compare.resolves(true);

            request(app)
                .post('/users/login')
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

        it('should return 401 when no user found', (done) => {
            const expectedEmail = 'some@email';
            findUserStub.resolves(null);

            request(app)
                .post('/users/login')
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
            findUserStub.resolves({password: 'password'});

            bcryptStub.compare.resolves(false);

            request(app)
                .post('/users/login')
                .send({email: expectedEmail, password: 'somepass'})
                .expect(401, (error) => {
                    sinon.assert.calledWithExactly(findUserStub, {email: expectedEmail});
                    sinon.assert.calledWithExactly(bcryptStub.compare, 'somepass', 'password');

                    if (error) {
                        return done(error);
                    }
                    done();
                })
        })
    })
});