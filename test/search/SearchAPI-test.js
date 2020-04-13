import app from "../../src/app";
import request from "supertest";
import sinon from "sinon";
import * as HereApiClient from "../../src/location/HereApiClient";
import * as ItemRepository from "../../src/item/ItemRepository";
import Index from '../../src/search/Index';
import {assert} from "chai";
import {Coordinates} from "../../src/location/Coordinates";
import {SearchItemHit} from "../../src/search/SearchItemHit";
import {Item} from "../../src/item/Item";
import SearchResultItem from "../../src/item/SearchResultItem";

describe('search API', () => {
    let geocodeStub;
    let searchByLocation;
    let getItemByIdsStub;
    const coordinatesForAddress = new Coordinates(12.34, 33.45);

    const itemId1 = 'some-id';
    const itemCity1 = 'Chicago';
    const itemImageUrl1 = 'abc.com';
    const itemTitle1 = 'some thing';
    const itemDailyRentalPrice1 = 1.2;
    const itemZipCode1 = '123-345';

    const itemId2 = 'some-other-id';
    const itemCity2 = 'Cincinnati';
    const itemImageUrl2 = 'def.com';
    const itemTitle2 = 'some other thing';
    const itemDailyRentalPrice2 = 2.2;
    const itemZipCode2 = '111-333';

    const hitItems = [
        new Item({
            id: itemId1,
            imageUrl: itemImageUrl1,
            title: itemTitle1,
            rentalDailyPrice: itemDailyRentalPrice1,
            location: {address: {city: itemCity1, zipCode: itemZipCode1}}
        }),
        new Item({
            id: itemId2,
            imageUrl: itemImageUrl2,
            title: itemTitle2,
            rentalDailyPrice: itemDailyRentalPrice2,
            location: {address: {city: itemCity2, zipCode: itemZipCode2}}
        })
    ];

    const searchResultItems = [
        new SearchResultItem({
            id: itemId1,
            city: itemCity1,
            imageUrl: itemImageUrl1,
            title: itemTitle1,
            dailyRentalPrice: itemDailyRentalPrice1,
            zipCode: itemZipCode1
        }),
        new SearchResultItem({
            id: itemId2,
            city: itemCity2,
            imageUrl: itemImageUrl2,
            title: itemTitle2,
            dailyRentalPrice: itemDailyRentalPrice2,
            zipCode: itemZipCode2
        })
    ]

    before(() => {
        geocodeStub = sinon
            .stub(HereApiClient, 'geocode')
            .resolves(coordinatesForAddress);

        searchByLocation = sinon
            .stub(Index, 'searchByLocation')
            .resolves([new SearchItemHit('some-id')]);

        getItemByIdsStub = sinon
            .stub(ItemRepository, 'getItemByIds')
            .resolves(hitItems);
    });

    beforeEach(() => {
        sinon.resetHistory();
    });

    after(() => {
        sinon.restore();
    });

    it('should get coordinates if not included in request', (done) => {
        const address = 'some address';
        const searchTerm = 'kitty cat';
        request(app)
            .post('/api/search')
            .send({
                searchTerm: searchTerm,
                address: address
            })
            .expect(200, (error, response) => {
                sinon.assert.calledWith(geocodeStub, address);
                sinon.assert.calledWith(searchByLocation, searchTerm, coordinatesForAddress);

                done(error);
            });
    });

    it('should search with passed in coordinates if there is one passed in', (done) => {
        const searchTerm = 'kitty cat';
        const coordinates = {latitude: '12', longitude: '34'};
        request(app)
            .post('/api/search')
            .send({
                searchTerm: searchTerm,
                coordinates: coordinates,
                address: 'some address'
            })
            .expect(200, (error, response) => {
                sinon.assert.notCalled(geocodeStub);
                sinon.assert.calledWith(searchByLocation, searchTerm, coordinates);

                done(error);
            })
    });

    it('should return one result per ID', (done) => {
        const searchTerm = 'kitty cat';
        const coordinates = {latitude: '12', longitude: '34'};

        request(app)
            .post('/api/search')
            .send({
                searchTerm: searchTerm,
                coordinates: coordinates,
            })
            .expect(200, (error, response) => {
                assert.deepEqual(response.body, searchResultItems);

                done(error);
            })
    });

});
