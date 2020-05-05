import database from '../../src/database.js';
import {getAllCategories, getItemCountForCategory} from "../../src/category/CategoryRepository";
import {expect} from 'chai';
import {setupItem, setupUser} from "../TestHelper";
import Index from "../../src/search/Index";
import sinon from "sinon";

const chai = require('chai');
const assertArrays = require('chai-arrays');
chai.use(assertArrays);

describe('category database', () => {
    beforeEach(async () => {
        sinon.restore();
        sinon.stub(Index);
        await database.none(`TRUNCATE public.category CASCADE`);
        await database.none(`TRUNCATE public."user" CASCADE`);
    });

    it('should return all category names', async () => {
        await createCategories();
        const categories = await getAllCategories();

        expect(categories).to.be.array();
        expect(categories.length).to.equal(2);
    });

    it('should return count of items for category', async () => {
        const electronics = 'electronics';
        const babyClothes = 'baby-clothes';
        const userEmail = 'someemail';
        await createCategories();
        await setupUser({email: userEmail});
        await setupItem({categories: [electronics], userEmail: userEmail})
        await setupItem({categories: [electronics], userEmail: userEmail})
        await setupItem({categories: [babyClothes], userEmail: userEmail})

        const count = await getItemCountForCategory(electronics);

        expect(count).to.equal(2);
    });

    const createCategories = async () => {
        await database.none(`INSERT INTO public.category (name)
                             VALUES ('electronics'),
                                    ('baby-clothes')`);
    };
});
