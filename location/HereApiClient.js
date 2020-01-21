import axios from "axios";

export default class HereApiClient {
    static autosuggest = (searchTerm) => {
        return axios.get('https://autocomplete.geocoder.ls.hereapi.com/6.2/suggest.json',
            {
                params: {
                    query: searchTerm,
                    country: 'USA',
                    apiKey: process.env.HERE_API_KEY
                }
            }
        ).then(response => {
            return response.data;
        })
    };

    static reverseGeocode = (coordinates) => {
        return axios.get('https://reverse.geocoder.ls.hereapi.com/6.2/reversegeocode.json',
            {
                params: {
                    prox: encodeURI(`${coordinates.latitude},${coordinates.longitude}`),
                    mode: 'retrieveAddress',
                    maxresults: 1,
                    gen: 9,
                    apiKey: process.env.HERE_API_KEY
                }
            }
        ).then(response => {
            return response.data.Response.View[0].Result[0].Location.Address.Label;
        })
    };

    static geocode = (searchAddress) => {
        return axios.get('https://geocoder.ls.hereapi.com/search/6.2/geocode.json',
            {
                params: {
                    apiKey: process.env.HERE_API_KEY,
                    languages: 'en-US',
                    maxresults: 1,
                    searchtext: searchAddress
                }
            }).then(response => {
            const navigationPosition = response.data.Response.View[0].Result[0].Location.NavigationPosition[0];
            return {latitude: navigationPosition.Latitude, longitude: navigationPosition.Longitude};
        }).catch(error => {
            console.error(`No coordinates found for address: ${searchAddress}: ${error}`);
            return null;
        })
    }
}