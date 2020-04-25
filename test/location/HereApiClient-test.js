import {autosuggest, geocode, routeDistanceInMiles} from "../../src/location/HereApiClient";
import {Coordinates} from "../../src/location/Coordinates";
import HereAutoSuggestion from "../../src/location/HereAutoSuggestion";
import {expect} from 'chai';
import nock from "nock";
import HERE_AUTOSUGGEST_RESPONSE from "./SampleHereApiAutosuggestResponse.json";
import HERE_GEOCODE_RESPONSE from "./SampleHereApiGeocodeResponse.json";
import HERE_MATRIX_ROUTING_RESPONSE from "./SampleHereApiMatrixRoutingResponse.json";
import Address from "../../src/location/Address";

describe('HERE API', () => {
    describe('autosuggest', () => {
        it('should return suggestions', async () => {
            nock('https://autocomplete.geocoder.ls.hereapi.com')
                .get(uri => uri.includes('2727+Hamp'))
                .reply(200, HERE_AUTOSUGGEST_RESPONSE);

            const coordinates = new Coordinates(41.932844, -87.644957);
            const expectedSuggestion = new HereAutoSuggestion({
                houseNumber: "2727",
                street: "Hampton Pkwy",
                city: "Evanston",
                state: "IL",
                zipCode: "60201"
            })
            const actual = await autosuggest('2727 Hamp', coordinates);

            expect(actual).to.have.length.of(5);
            expect(actual).to.deep.include(expectedSuggestion);
        })
    });

    describe('geocode', () => {
        it('should return coordinates of address', async () => {
            const address = new Address({
                street: '222 merchandise mart',
                city: 'chicago',
                state: 'IL',
                zipCode: ''
            })
            nock('https://geocoder.ls.hereapi.com')
                .get(uri => uri.includes('merchandise'))
                .reply(200, HERE_GEOCODE_RESPONSE);

            const actual = await geocode(address);

            expect(actual.latitude).to.equal(41.89659)
            expect(actual.longitude).to.equal(-87.6353487)
        })
    });

    describe('route distance in miles', () => {
        it('should return distance between coordinates in miles', async () => {
            const startCoordinates = new Coordinates(12.22, 33.45);
            const endCoordinates = new Coordinates(35.22, 51.21);

            nock('https://route.ls.hereapi.com')
                .get(uri =>
                    uri.includes(startCoordinates.latitude.toString()) &&
                    uri.includes(startCoordinates.longitude.toString()) &&
                    uri.includes(endCoordinates.latitude.toString()) &&
                    uri.includes(endCoordinates.longitude.toString()))
                .reply(200, HERE_MATRIX_ROUTING_RESPONSE);

            const actual = await routeDistanceInMiles(startCoordinates, endCoordinates);
        })
    });
})
