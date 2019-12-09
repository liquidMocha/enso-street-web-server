import database from "../database";
import ItemRepository from "../item/ItemRepository";
import ItemDAO from "../item/ItemDAO";
import {setupUser} from "./TestHelper";
import sinon from "sinon";
import ImageRepository from "../item/ImageRepository";

const {expect} = require('chai');

describe('item data', () => {
    const userEmail = 'some@email.com';
    beforeEach(async () => {
        await setupUser({email: userEmail});
    });

    afterEach(() => {
        database.none('truncate public.item cascade;');
    });

    it('should save an item', async () => {
        const mock = sinon.mock(ImageRepository).expects("getSignedS3Request");
        const title = "some title";
        const rentalDailyPrice = 1.23;
        const deposit = 50.23;
        const condition = "like-new";
        const categories = ['garden-and-patio', 'music-instruments'];
        const description = "the item's description";
        const canBeDelivered = true;
        const deliveryStarting = 1.45;
        const deliveryAdditional = 0.8;
        const location = {};
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
            mock.verify();
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
                }
            )
        });
    })
});