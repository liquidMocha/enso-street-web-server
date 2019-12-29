import database from "../../database";
import ItemRepository from "../../item/ItemRepository";
import ItemDAO from "../../item/ItemDAO";
import {setupCategories, setupUser} from "../TestHelper";
import sinon from "sinon";
import ImageRepository from "../../item/ImageRepository";
import UserRepository from "../../user/UserRepository";
import chai from 'chai';
import 'chai-as-promised';

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

    describe('save item', () => {
        it('should save an item', async () => {
            const s3SignedUrl = 'some.url';
            const fakeS3SignedRequest = sinon.fake.returns(s3SignedUrl);
            sinon.replace(ImageRepository, "getSignedS3Request", fakeS3SignedRequest);
            const title = "some title";
            const rentalDailyPrice = 1.23;
            const deposit = 50.23;
            const condition = "like-new";
            const categories = ['garden-and-patio', 'music-instruments'];
            const description = "the item's description";
            const canBeDelivered = true;
            const deliveryStarting = 1.45;
            const deliveryAdditional = 0.8;
            const location = {street: '', zipCode: '', city: '', state: '', userId: userId};
            await ItemRepository.save(new ItemDAO({
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
                ownerEmail: userEmail
            })).then((data) => {
                expect(fakeS3SignedRequest.callCount).to.equal(1);
                expect(data).to.equal(s3SignedUrl);
                return database.many(`select *, c.name as category
                                      from public.item
                                               join itemtocategory i on item.id = i.itemid
                                               join category c on i.categoryid = c.id
                                               join condition c2 on item.condition = c2.id
                                               join public."user" u on u.id = item.owner
                                      order by categoryid
                `)
            }).then(rows => {
                expect(rows.length).to.equal(2);
                expect(rows[0].category).to.equal(categories[0]);
                expect(rows[1].category).to.equal(categories[1]);
                rows.forEach(row => {
                        expect(row.title).to.equal(title);
                        expect(Number(row.rentaldailyprice)).to.equal(rentalDailyPrice);
                        expect(Number(row.deposit)).to.equal(deposit);
                        expect(row.condition).to.equal(condition);
                        expect(row.description).to.equal(description);
                        expect(row.canbedelivered).to.equal(canBeDelivered);
                        expect(Number(row.deliverystarting)).to.equal(deliveryStarting);
                        expect(Number(row.deliveryadditional)).to.equal(deliveryAdditional);
                        expect(row.email).to.equal(userEmail);
                        expect(row.searchable).to.equal(true);
                    }
                )
            });
        });
    });

    describe('get items', () => {
        it('should throw exception if user is not found', () => {
            const fakeFindUser = sinon.fake.returns(new Promise(((resolve, reject) => {
                resolve(null);
            })));
            sinon.replace(UserRepository, "findOne", fakeFindUser);

            return ItemRepository.getItemsForUser(userEmail).should.eventually.be.rejected;
        });

        it('should get all items for user', async () => {
            const s3SignedUrl = 'some.url';
            const fakeS3SignedRequest = sinon.fake.returns(new Promise(
                (resolve, reject) => {
                    resolve(s3SignedUrl)
                }));
            sinon.replace(ImageRepository, "getSignedS3Request", fakeS3SignedRequest);

            const title = "some title";
            const rentalDailyPrice = 1.23;
            const deposit = 50.23;
            const condition = "like-new";
            const categories = ['garden-and-patio', 'music-instruments'];
            const description = "the item's description";
            const canBeDelivered = true;
            const deliveryStarting = 1.45;
            const deliveryAdditional = 0.8;
            const locationNickname = 'Home';
            const locationStreet = 'Clark';
            const locationZipCode = '10101';
            const locationCity = 'Chicago';
            const locationState = 'Illinois';
            const location = {
                nickname: locationNickname,
                street: locationStreet,
                zipCode: locationZipCode,
                city: locationCity,
                state: locationState,
                userId: userId
            };

            await ItemRepository.save(new ItemDAO({
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
                ownerEmail: userEmail
            }));

            const items = await ItemRepository.getItemsForUser(userEmail);

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
            expect(items[0].location.nickname).to.equal(locationNickname);
            expect(items[0].location.street).to.equal(locationStreet);
            expect(items[0].location.zipCode).to.equal(locationZipCode);
            expect(items[0].location.city).to.equal(locationCity);
            expect(items[0].location.state).to.equal(locationState);
            expect(items[0].imageUrl).to.include(`https://${process.env.Bucket}.s3.amazonaws.com`);
            expect(items[0].searchable).to.equal(true);
        })
    })
});