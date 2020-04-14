import axios from "axios";
import {Coordinates} from "./Coordinates";
import Address from "./Address";
import HereAutoSuggestion from "./HereAutoSuggestion";

export const autosuggest = async (searchTerm: string, coordinates: Coordinates): Promise<HereAutoSuggestion[]> => {
    const response = axios.get<HereAutoSuggestionResponse>('https://autocomplete.geocoder.ls.hereapi.com/6.2/suggest.json',
        {
            params: {
                query: searchTerm,
                prox: `${coordinates.latitude},${coordinates.longitude},10000`,
                country: 'USA',
                apiKey: process.env.HERE_API_KEY
            }
        }
    )

    return (await response).data.suggestions.map(suggestion => {
        const address = suggestion.address;
        return new HereAutoSuggestion(
            {
                houseNumber: address.houseNumber,
                street: address.street,
                city: address.postalCode,
                state: address.city,
                zipCode: address.state
            }
        )
    });
};

export const geocode = async (location: Address): Promise<Coordinates> => {
    const street = `${location.street ? (location.street + ', ') : ''}`;
    const city = `${location.city ? (location.city + ', ') : ''}`;
    const state = `${location.state ? (location.state + ', ') : ''}`;
    const zipCode = `${location.zipCode ? (location.zipCode) : ''}`;
    const addressString = `${street}${city}${state}${zipCode}`;

    const geocodeResponse = axios.get('https://geocoder.ls.hereapi.com/search/6.2/geocode.json',
        {
            params: {
                apiKey: process.env.HERE_API_KEY,
                languages: 'en-US',
                maxresults: 1,
                searchtext: addressString
            }
        });

    const navigationPosition = (await geocodeResponse).data.Response.View[0].Result[0].Location.NavigationPosition[0];
    return new Coordinates(navigationPosition.Latitude, navigationPosition.Longitude);
};

export const routeDistanceInMiles = async (startCoordinates: Coordinates, endCoordinates: Coordinates): Promise<number> => {
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

class HereAutoSuggestionAddress {
    readonly houseNumber: string;
    readonly street: string;
    readonly postalCode: string;
    readonly city: string;
    readonly state: string;
}

class HereAutoSuggestionDTO {
    readonly address: HereAutoSuggestionAddress
}

class HereAutoSuggestionResponse {
    readonly suggestions: HereAutoSuggestionDTO[];
}
