import axios from "axios";

export default class HereApiClient {
    static autosuggest = (searchTerm) => {
        return axios.get('https://autocomplete.geocoder.ls.hereapi.com/6.2/suggest.json',
            {
                params: {
                    query: searchTerm,
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
    }
}