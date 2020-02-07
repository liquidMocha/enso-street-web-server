import database from '../../database';
import CategoryRepository from "../../category/CategoryRepository";
import {expect} from 'chai';
import ItemRepository from "../../item/ItemRepository";
import {ItemDAO} from "../../item/ItemDAO";
import UserRepository from "../../user/UserRepository";

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
        const categories = await CategoryRepository.getAllCategories();

        expect(categories).to.be.array();
        expect(categories.length).to.equal(2);
    });

    it('should return count of items for category', async () => {
        const electronics = 'electronics';
        const babyClothes = 'baby-clothes';
        const userEmail = 'someemail';
        await createCategories();
        await setupUser(userEmail);
        await setupItem([electronics], userEmail);
        await setupItem([electronics], userEmail);
        await setupItem([babyClothes], userEmail);

        const count = await CategoryRepository.getItemCountForCategory(electronics);

        expect(count).to.equal(2);
    });

    const createCategories = async () => {
        await database.none(`INSERT INTO public.category (name)
                             VALUES ('electronics'),
                                    ('baby-clothes')`);
    };

    const setupUser = async (userEmail) => {
        await UserRepository.findOrCreate({email: userEmail, name: 'some name'});
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