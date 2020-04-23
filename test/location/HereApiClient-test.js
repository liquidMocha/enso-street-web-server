import {autosuggest} from "../../src/location/HereApiClient";
import {Coordinates} from "../../src/location/Coordinates";
import HereAutoSuggestion from "../../src/location/HereAutoSuggestion";
import {expect} from 'chai';
import nock from "nock";
import HERE_AUTOSUGGEST_RESPONSE from "./SampleHereApiAutosuggestResponse.json";

describe('HERE API', () => {
    describe('autosuggest', () => {
        it('should return suggestions', async () => {
            const scope = nock('https://autocomplete.geocoder.ls.hereapi.com')
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

            expect(actual).to.deep.include(expectedSuggestion)
        })
    })
})
