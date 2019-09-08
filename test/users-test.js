import request from "supertest";
import UserService from "../user/UserService";
import sinon from "sinon";

const should = require('should');
const assert = require('assert');
const app = require('../app');

describe('users', () => {

    let userService;
    beforeEach(() => {
        userService = new UserService();
        sinon.spy(userService, "createUser");
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

        assert(userService.createUser.calledOnce)
    })
});