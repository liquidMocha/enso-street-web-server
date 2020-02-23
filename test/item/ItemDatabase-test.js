import database from "../../database";
import {ItemDAO} from "../../item/ItemDAO";
import {setupCategories, setupUser} from "../TestHelper";
import sinon from "sinon";
import UserRepository from "../../user/UserRepository";
import chai from 'chai';
import 'chai-as-promised';
import {getItemById, getItemByIds, getItemsForUser, save} from "../../item/ItemRepository";

const chaiAsPromised = require('chai-as-promised');
const should = chai.should();
chai.use(chaiAsPromised);
const {expect} = require('chai');

describe('item data', () => {
    const userEmail = 'some@email.com';
    let userId;
    beforeEach(async () => {
        userId = await setupUser({email: userEmail});
        await setupCategories(['garden-and-patio', 'music-instruments']);
    });

    afterEach(() => {
        sinon.restore();
        database.none(`TRUNCATE public.item CASCADE;`);
    });

    describe('get items', () => {
        it('should throw exception if user is not found', () => {
            const fakeFindUser = sinon.fake.returns(new Promise(((resolve, reject) => {
                resolve(null);
            })));
            sinon.replace(UserRepository, "findOne", fakeFindUser);

            return getItemsForUser(userEmail).should.eventually.be.rejected;
        });

        it('should save an item and get it back for user', async () => {
            const title = "some title";
            const rentalDailyPrice = 1.23;
            const deposit = 50.23;
            const condition = "like-new";
            const categories = ['garden-and-patio', 'music-instruments'];
            const description = "the item's description";
            const canBeDelivered = true;
            const deliveryStarting = 1.45;
            const deliveryAdditional = 0.8;
            const locationStreet = 'Clark';
            const locationZipCode = '10101';
            const locationCity = 'Chicago';
            const locationState = 'IL';
            const latitude = 41.90934;
            const longitude = -87.62785;
            const imageUrl = 'someurl.com';

            const location = {
                street: locationStreet,
                zipCode: locationZipCode,
                city: locationCity,
                state: locationState,
                userId: userId,
                latitude: latitude,
                longitude: longitude
            };

            await save(new ItemDAO({
                title: title,
                rentalDailyPrice: rentalDailyPrice,
                deposit: deposit,
                condition: condition,
                categories: categories,
                description: description,
                canBeDelivered: canBeDelivered,
                deliveryStarting: deliveryStarting,
                deliveryAdditional: deliveryAdditional,
                location: location,
                ownerEmail: userEmail,
                imageUrl: imageUrl
            }));

            const items = await getItemsForUser(userEmail);

            expect(items.length).to.equal(1);
            expect(items[0].title).to.equal(title);
            expect(Number(items[0].rentalDailyPrice)).to.equal(rentalDailyPrice);
            expect(Number(items[0].deposit)).to.equal(deposit);
            expect(items[0].condition).to.equal(condition);
            expect(items[0].categories).to.include(categories[0]);
            expect(items[0].categories).to.include(categories[1]);
            expect(items[0].description).to.equal(description);
            expect(items[0].canBeDelivered).to.equal(canBeDelivered);
            expect(Number(items[0].deliveryStarting)).to.equal(deliveryStarting);
            expect(Number(items[0].deliveryAdditional)).to.equal(deliveryAdditional);
            expect(items[0].location.street).to.equal(locationStreet);
            expect(items[0].location.zipCode).to.equal(locationZipCode);
            expect(items[0].location.city).to.equal(locationCity);
            expect(items[0].location.state).to.equal(locationState);
            expect(items[0].location.latitude).to.equal(latitude);
            expect(items[0].location.longitude).to.equal(longitude);
            expect(items[0].imageUrl).to.equal(imageUrl);
            expect(items[0].searchable).to.equal(true);
        })
    });

    it('get items by IDs', async () => {
        const aSavedItem = await setupItems();
        const anotherSavedItem = await setupItems();

        const items = await getItemByIds([aSavedItem.id, anotherSavedItem.id]);

        expect(items.length).to.equal(2);
    });

    it('get item by ID', async () => {
        const aSavedItem = await setupItems();

        const item = await getItemById(aSavedItem.id);

        expect(item).to.have.property('archive');
        expect(item.id).to.equal(aSavedItem.id).but.not.be.undefined;
        expect(item.title).to.equal(aSavedItem.title).but.not.be.undefined;
        expect(item.deposit).to.equal(aSavedItem.deposit).but.not.be.undefined;
        expect(item.rentalDailyPrice).to.equal(aSavedItem.rentaldailyprice).but.not.be.undefined;
        expect(item.deliveryStarting).to.equal(aSavedItem.deliverystarting).but.not.be.undefined;
        expect(item.deliveryAdditional).to.equal(aSavedItem.deliveryadditional).but.not.be.undefined;
        expect(item.condition).to.equal(aSavedItem.condition).but.not.be.undefined;
        expect(item.description).to.equal(aSavedItem.description).but.not.be.undefined;
        expect(item.imageUrl).to.equal(aSavedItem.image_url).but.not.be.undefined;
        expect(item.canBeDelivered).to.equal(aSavedItem.canbedelivered).but.not.be.undefined;
        expect(item.location.latitude).to.equal(aSavedItem.latitude).but.not.be.undefined;
        expect(item.location.longitude).to.equal(aSavedItem.longitude).but.not.be.undefined;
    });

    const setupItems = async () => {
        const title = "some title";
        const rentalDailyPrice = 1.23;
        const deposit = 50.23;
        const condition = "like-new";
        const categories = ['garden-and-patio', 'music-instruments'];
        const description = "the item's description";
        const canBeDelivered = true;
        const deliveryStarting = 1.45;
        const deliveryAdditional = 0.8;
        const locationStreet = 'Clark';
        const locationZipCode = '10101';
        const locationCity = 'Chicago';
        const locationState = 'IL';
        const latitude = 41.90934;
        const longitude = -87.62785;
        const imageUrl = 'someurl.com';

        const location = {
            street: locationStreet,
            zipCode: locationZipCode,
            city: locationCity,
            state: locationState,
            userId: userId,
            latitude: latitude,
            longitude: longitude
        };

        return await new ItemDAO({
            title: title,
            rentalDailyPrice: rentalDailyPrice,
            deposit: deposit,
            condition: condition,
            categories: categories,
            description: description,
            canBeDelivered: canBeDelivered,
            deliveryStarting: deliveryStarting,
            deliveryAdditional: deliveryAdditional,
            location: location,
            ownerEmail: userEmail,
            imageUrl: imageUrl
        }).save();
    }
});
