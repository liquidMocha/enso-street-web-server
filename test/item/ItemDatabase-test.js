import database from "../../database";
import ItemRepository from "../../item/ItemRepository";
import ItemDAO from "../../item/ItemDAO";
import {setupCategories, setupUser} from "../TestHelper";
import sinon from "sinon";
import ImageRepository from "../../item/ImageRepository";

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
});