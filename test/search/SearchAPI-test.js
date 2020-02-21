import app from "../../app";
import request from "supertest";
import sinon from "sinon";
import * as HereApiClient from "../../location/HereApiClient";
import * as ItemRepository from "../../item/ItemRepository";
import Index from '../../search/Index';
import {assert} from "chai";

describe('search API', () => {
    let geocodeStub;
    let searchByLocation;
    let getItemByIdsStub;
    const coordinatesForAddress = {latitude: 12.34, longitude: 33.45};
    const searchResults = [{id: 'some-id'}, {id: 'some-other-id'}];

    before(() => {
        geocodeStub = sinon
            .stub(HereApiClient, 'geocode')
            .resolves(coordinatesForAddress);

        searchByLocation = sinon
            .stub(Index, 'searchByLocation')
            .resolves([{id: 'some-id'}]);

        getItemByIdsStub = sinon
            .stub(ItemRepository, 'getItemByIds')
            .resolves(searchResults);
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
                assert.deepEqual(response.body, searchResults);

                done(error);
            })
    });

});
