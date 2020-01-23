import app from "../../app";
import request from "supertest";
import sinon from "sinon";
import HereApiClient from "../../location/HereApiClient";
import ItemRepository from "../../item/ItemRepository";
import Index from '../../search/Index';

describe('search API', () => {
    let geocodeStub;
    let searchByLocation;
    let getItemByIdsStub;
    let coordinatesForAddress = {latitude: 12.34, longitude: 33.45};

    before(() => {
        geocodeStub = sinon
            .stub(HereApiClient, 'geocode')
            .returns(new Promise((resolve, reject) => {
                    resolve(coordinatesForAddress)
                }
            ));

        getItemByIdsStub = sinon
            .stub(ItemRepository, 'getItemByIds')
            .returns(new Promise((resolve, reject) => {
                    resolve([{id: 'some-id'}])
                }
            ));

        searchByLocation = sinon
            .stub(Index, 'searchByLocation')
            .returns(new Promise((resolve, reject) => {
                resolve([{id: 'some-id'}]);
            }));
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
            .expect(201, (error, message) => {
                sinon.assert.calledWith(geocodeStub, address);
                sinon.assert.calledWith(searchByLocation, searchTerm, coordinatesForAddress);

                done();
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
            .expect(200, (error, message) => {
                sinon.assert.notCalled(geocodeStub);
                sinon.assert.calledWith(searchByLocation, searchTerm, coordinates);

                done();
            })
    })

});