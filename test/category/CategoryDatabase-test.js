import database from '../../database';
import CategoryRepository from "../../category/CategoryRepository";
import {expect} from 'chai';

const chai = require('chai');
const assertArrays = require('chai-arrays');
chai.use(assertArrays);

describe('category database', () => {

    beforeEach(async () => {
        await database.none(`TRUNCATE public.category CASCADE`);
    });

    it('should return all category names', async () => {
        await database.none(`INSERT INTO public.category (name)
                             VALUES ('electronics'),
                                    ('baby-clothes')`);
        const categories = await CategoryRepository.getAllCategories();

        expect(categories).to.be.array();
        expect(categories.length).to.equal(2);
    })
});