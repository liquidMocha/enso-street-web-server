import app from "../../src/app";
import request from "supertest";
import chai, {expect} from "chai";
import sinon from "sinon";
import * as CategoryRepository from "../../src/category/CategoryRepository";
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import assertArrays from 'chai-arrays';

chai.use(assertArrays);
chai.use(deepEqualInAnyOrder);

describe('category API', () => {
    let getCategoriesStub;
    let getCategoryItemCountStub;

    before(() => {
        getCategoriesStub = sinon.stub(CategoryRepository, 'getAllCategories');
        getCategoryItemCountStub = sinon.stub(CategoryRepository, 'getItemCountForCategory')
    });

    after(() => {
        sinon.restore();
    });

    it('should return categories from category repo', (done) => {
        const categories = ['category 1', 'category 2'];
        getCategoriesStub.resolves(categories);
        request(app)
            .get('/api/category')
            .expect(200, (error, response) => {
                const responseBody = response.body;
                expect(responseBody).to.be.array();
                expect(responseBody).to.deep.equalInAnyOrder(categories);
                done(error);
            })
    });

    it('should return count of items in category', (done) => {
        const category = 'some-category';
        const expectedCount = 42;
        getCategoryItemCountStub.resolves(expectedCount);

        request(app)
            .get('/api/category/' + category + '/count')
            .expect(200, (error, response) => {
                sinon.assert.calledWith(getCategoryItemCountStub, category);
                expect(response.body).to.equal(expectedCount);
                done(error);
            })
    });
});
