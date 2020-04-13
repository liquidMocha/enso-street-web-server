import database from '../../src/database.js';
import {getAllCategories, getItemCountForCategory} from "../../src/category/CategoryRepository";
import {expect} from 'chai';
import * as ItemRepository from "../../src/item/ItemRepository";
import {setupUser} from "../TestHelper";
import {Item} from "../../src/item/Item";
import {uuid} from "uuidv4";
import Index from "../../src/search/Index";
import sinon from "sinon";
import ItemLocation from "../../src/item/ItemLocation";
import Address from "../../src/location/Address";
import {Coordinates} from "../../src/location/Coordinates";

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
        await ItemRepository.save(new Item(
            {
                id: uuid(),
                title: "",
                description: "",
                categories: categories,
                imageUrl: "",
                rentalDailyPrice: 0,
                deposit: 0,
                condition: 'normal-wear',
                canBeDelivered: true,
                deliveryStarting: 0,
                deliveryAdditional: 0,
                location: new ItemLocation(
                    new Address({street: "", city: "", state: "", zipCode: ""}),
                    new Coordinates(1, 1)
                ),
                ownerEmail: userEmail,
                searchable: true,
                archived: false,
                createdOn: null
            }
        ));
    }
});
