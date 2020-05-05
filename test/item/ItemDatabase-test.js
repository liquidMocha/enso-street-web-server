import {uuid} from "uuidv4";
import database from "../../src/database.js";
import {setupCategories, setupItem, setupUser} from "../TestHelper";
import sinon from "sinon";
import UserRepository from "../../src/user/UserRepository";
import chai from 'chai';
import 'chai-as-promised';
import {getItemById, getItemByIds, getItemsForUser, save} from "../../src/item/ItemRepository";
import {Item} from "../../src/item/Item";
import ItemLocation from "../../src/item/ItemLocation";
import Address from "../../src/location/Address";
import {Coordinates} from "../../src/location/Coordinates";
import Index from "../../src/search/Index";
import {Owner} from "../../src/item/Owner";

const chaiAsPromised = require('chai-as-promised');
const should = chai.should();
chai.use(chaiAsPromised);
const {expect} = require('chai');

describe('item data', () => {
    const userEmail = 'some@email.com';
    const userId = uuid();
    beforeEach(async () => {
        sinon.restore();
        sinon.stub(Index);
        await setupUser({id: userId, email: userEmail});
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
            sinon.replace(UserRepository, "findOneUser", fakeFindUser);

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

            const location = new ItemLocation(
                new Address({
                    street: locationStreet,
                    zipCode: locationZipCode,
                    city: locationCity,
                    state: locationState,
                }),
                new Coordinates(latitude, longitude)
            );

            await save(new Item(
                {
                    id: uuid(),
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
                    owner: new Owner(userId, userEmail),
                    imageUrl: imageUrl
                }
            ));

            const items = await getItemsForUser(userId);

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
            expect(items[0].location.address.street).to.equal(locationStreet);
            expect(items[0].location.address.zipCode).to.equal(locationZipCode);
            expect(items[0].location.address.city).to.equal(locationCity);
            expect(items[0].location.address.state).to.equal(locationState);
            expect(items[0].location.coordinates.latitude).to.equal(latitude);
            expect(items[0].location.coordinates.longitude).to.equal(longitude);
            expect(items[0].imageUrl).to.equal(imageUrl);
            expect(items[0].searchable).to.equal(true);
        })
    });

    it('get items by IDs', async () => {
        const id1 = uuid();
        const id2 = uuid();
        const aSavedItem = await setupItem({itemId: id1});
        const anotherSavedItem = await setupItem({itemId: id2});

        const items = await getItemByIds([id1, id2]);

        expect(items.length).to.equal(2);
    });

    it('get item by ID', async () => {
        const itemId = uuid();
        const aSavedItem = await setupItem({itemId: itemId});

        const item = await getItemById(itemId);

        expect(item).to.have.property('archive');
        expect(item.id).to.equal(aSavedItem.id).but.not.be.undefined;
        expect(item.title).to.equal(aSavedItem.title).but.not.be.undefined;
        expect(item.deposit).to.equal(aSavedItem.deposit).but.not.be.undefined;
        expect(item.rentalDailyPrice).to.equal(aSavedItem.rentalDailyPrice).but.not.be.undefined;
        expect(item.deliveryStarting).to.equal(aSavedItem.deliveryStarting).but.not.be.undefined;
        expect(item.deliveryAdditional).to.equal(aSavedItem.deliveryAdditional).but.not.be.undefined;
        expect(item.condition).to.equal(aSavedItem.condition).but.not.be.undefined;
        expect(item.description).to.equal(aSavedItem.description).but.not.be.undefined;
        expect(item.imageUrl).to.equal(aSavedItem.imageUrl).but.not.be.undefined;
        expect(item.canBeDelivered).to.equal(aSavedItem.canBeDelivered).but.not.be.undefined;
        expect(item.location.coordinates.latitude).to.equal(aSavedItem.location.coordinates.latitude).but.not.be.undefined;
        expect(item.location.coordinates.longitude).to.equal(aSavedItem.location.coordinates.longitude).but.not.be.undefined;
    });
});
