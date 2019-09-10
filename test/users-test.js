import request from "supertest";
import UserService from "../user/UserService";
import sinon from "sinon";
import app from "../app";

const should = require('should');
const assert = require('assert');

describe('users', () => {

    beforeEach(() => {
    });

    it('should create a user', (done) => {
        let user = {
            'email': 'user@email.com',
            'name': 'Robert Dunder',
            'password': 'ituhg240#'
        };

        request(app)
            .post('/users/createUser')
            .send(user)
            .expect(201, done);
    })
});