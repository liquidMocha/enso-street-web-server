import axios from "axios";

export const autosuggest = (searchTerm, coordinates) => {
    return axios.get('https://autocomplete.geocoder.ls.hereapi.com/6.2/suggest.json',
        {
            params: {
                query: searchTerm,
                prox: `${coordinates.latitude},${coordinates.longitude},10000`,
                country: 'USA',
                apiKey: process.env.HERE_API_KEY
            }
        }
    ).then(response => {
        return response.data;
    })
};

export const geocode = (searchAddress) => {
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
};

export const routeDistanceInMiles = async (startCoordinates, endCoordinates) => {
    const startWayPoint = `geo!${startCoordinates.latitude},${startCoordinates.longitude}`;
    const endWayPoint = `geo!${endCoordinates.latitude},${endCoordinates.longitude}`;

    const response = axios.get('https://route.ls.hereapi.com/routing/7.2/calculateroute.json',
        {
            params: {
                apiKey: process.env.HERE_API_KEY,
                waypoint0: `geo!${startCoordinates.latitude},${startCoordinates.longitude}`,
                waypoint1: `geo!${endCoordinates.latitude},${endCoordinates.longitude}`,
                mode: 'fastest;car;traffic:disabled'
            }
        });

    return ((await response).data.response.route[0].summary.distance / 1000) * 0.621371
};
