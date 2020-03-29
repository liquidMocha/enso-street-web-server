import database from '../../database';
import {getAllCategories, getItemCountForCategory} from "../../category/CategoryRepository";
import {expect} from 'chai';
import * as ItemRepository from "../../item/ItemRepository";
import {ItemDAO} from "../../item/ItemDAO";
import {setupUser} from "../TestHelper";

const chai = require('chai');
const assertArrays = require('chai-arrays');
chai.use(assertArrays);

describe('category database', () => {

    beforeEach(async () => {
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
        await setupItem([electronics], userEmail);
        await setupItem([electronics], userEmail);
        await setupItem([babyClothes], userEmail);

        const count = await getItemCountForCategory(electronics);

        expect(count).to.equal(2);
    });

    const createCategories = async () => {
        await database.none(`INSERT INTO public.category (name)
                             VALUES ('electronics'),
                                    ('baby-clothes')`);
    };

    const setupItem = async (categories, userEmail) => {
        await ItemRepository.save(new ItemDAO({
            categories: categories,
            ownerEmail: userEmail,
            condition: 'normal-wear',
            location: {longitude: 21, latitude: 12}
        }));
    }
});
