import app from "../../app";
import request from "supertest";
import chai, {expect} from "chai";
import sinon from "sinon";
import CategoryRepository from "../../category/CategoryRepository";
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import assertArrays from 'chai-arrays';

chai.use(assertArrays);
chai.use(deepEqualInAnyOrder);

describe('category API', () => {
    let getCategoriesStub;
    const categories = ['category 1', 'category 2'];

    before(() => {
        getCategoriesStub = sinon
            .stub(CategoryRepository, 'getAllCategories')
            .returns(new Promise((resolve, reject) => {
                resolve(categories)
            }))
    });

    it('should return categories from category repo', (done) => {
        request(app)
            .get('/api/category')
            .expect(200, (error, response) => {
                const responseBody = response.body;
                expect(responseBody).to.be.array();
                expect(responseBody).to.deep.equalInAnyOrder(categories);
                done();
            })
    })
});