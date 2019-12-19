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
    }
}