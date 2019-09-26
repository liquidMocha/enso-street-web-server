import request from "supertest";
import UserService from "../user/UserService";
import app from "../app";
import sinon from 'sinon';

describe('users', () => {
    let createUserStub;

    before(() => {
        createUserStub = sinon.stub(UserService, 'createEnsoUser');
    });

    beforeEach(() => {
        createUserStub.resetHistory();
    });

    after(() => {
        sinon.restore();
    });

    describe('create user', () => {
        let user;

        beforeEach(() => {
            user = {
                'email': 'user@email.com',
                'name': 'Robert Dunder',
                'password': 'ituhg240#'
            };
        });

        it('should return a 201 if successfully created user', (done) => {
            createUserStub.resolves();

            request(app)
                .post('/users/createUser')
                .send(user)
                .expect(201, (error, result) => {
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
                .expect(500, (error, result) => {
                    sinon.assert.calledWithExactly(createUserStub, user.name, user.password, user.email);
                    if (error) {
                        return done(error);
                    }

                    done();
                });
        })
    });
});