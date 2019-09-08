import request from "supertest";

const should = require('should');
const assert = require('assert');
const app = require('../app');

describe('users', () =>{

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