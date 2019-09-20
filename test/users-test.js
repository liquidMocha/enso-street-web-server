import request from "supertest";
import UserService from "../user/UserService";
import app from "../app";
import sinon from 'sinon';

describe('users', () => {
    let createUserStub = sinon.stub(UserService, 'createUser');

    beforeEach(() => {
        createUserStub.resetHistory();
    });

    it('should return a 201 if successfully created user', (done) => {
        let user = {
            'email': 'user@email.com',
            'name': 'Robert Dunder',
            'password': 'ituhg240#'
        };

        request(app)
            .post('/users/createUser')
            .send(user)
            .expect(201, (error, result) => {
                sinon.assert.calledWithExactly(createUserStub, user.name, user.password, user.email);
                if(error) { return done(error);}

                done();
            });
    });
});