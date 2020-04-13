import express from "express";
import UserRepository from "../user/UserRepository";
import Location from './Location';
import {createLocation, getLocationsForUser, updateLocation} from "./LocationRepository";
import {autosuggest, routeDistanceInMiles} from "./HereApiClient";

const router = express.Router();

router.get('/', async (req, res, next) => {
    const userEmail = req.session.email;
    if (userEmail) {
        const user = await UserRepository.findOne({email: userEmail});

        if (user) {
            const locations = await getLocationsForUser(user.id);
            res.status(200).json(locations);
        } else {
            res.status(404).send();
        }
    } else {
        res.status(401).send();
    }
});

router.put('/', async (req, res, next) => {
    const userEmail = req.session.email;
    if (userEmail) {
        const user = await UserRepository.findOne({email: userEmail});

        if (user) {
            const newLocationId = await createLocation(req.body.location, user.id);
            res.status(201).json(newLocationId);
        } else {
            res.status(404).send();
        }
    } else {
        res.status(401).send();
    }
});

router.put('/:locationId', async (req, res, next) => {
    const userEmail = req.session.email;
    const locationId = req.params.locationId;
    const location = req.body.location;

    if (userEmail) {
        const user = await UserRepository.findOne({email: userEmail});
        if (user) {
            const updatedLocation = await updateLocation(
                new Location(
                    locationId,
                    location.street,
                    location.city,
                    location.state,
                    location.zipCode,
                    location.nickname
                ), user.id
            );

            res.status(200).json(updatedLocation);
        } else {
            res.status(401).send();
        }
    } else {
        res.status(401).send();
    }
});

router.get('/autosuggest/:searchTerm', (req, res, next) => {
    const userEmail = req.session.email;
    const queryParameters = req.query;

    autosuggest(req.params.searchTerm,
        {latitude: queryParameters.latitude, longitude: queryParameters.longitude}
    ).then(result => {
        const suggestedAddresses = result.suggestions.map(suggestion => {
            const address = suggestion.address;
            return {
                houseNumber: address.houseNumber,
                street: address.street,
                zipCode: address.postalCode,
                city: address.city,
                state: address.state
            }
        });
        res.status(200).json(suggestedAddresses);
    }).catch(error => {
        console.error(error);
        throw new Error(`Error when getting autosuggest location.`);
    });
});

router.get('/distance', async (req, res, next) => {
    const startLatitude = req.query.startLatitude;
    const startLongitude = req.query.startLongitude;
    const endLatitude = req.query.endLatitude;
    const endLongitude = req.query.endLongitude;

    const startCoordinates = {latitude: startLatitude, longitude: startLongitude};
    const endCoordinates = {latitude: endLatitude, longitude: endLongitude};

    const distance = (await routeDistanceInMiles(startCoordinates, endCoordinates));
    res.status(200).json({distance})
});

export default router;
