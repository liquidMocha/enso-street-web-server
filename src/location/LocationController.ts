import express from "express";
import Location from './Location';
import {createLocation, getLocationById, getLocationsForUser, updateLocation} from "./LocationRepository";
import {autosuggest, routeDistanceInMiles} from "./HereApiClient";
import {Coordinates} from "./Coordinates";

const router = express.Router();

router.get('/', async (req, res, next) => {
    const userId = req.session?.userId;
    if (userId) {
        const locations = await getLocationsForUser(userId);
        res.status(200).json(locations);
    } else {
        res.status(401).send();
    }
});

router.put('/', async (req, res, next) => {
    const userId = req.session?.userId;
    if (userId) {
        const location = Location.create(
            req.body.location.street,
            req.body.location.city,
            req.body.location.state,
            req.body.location.zipCode,
            req.body.location.nickname
        )
        const newLocationId = await createLocation(location, userId);
        res.status(201).json(newLocationId);
    } else {
        res.status(401).send();
    }
});

router.put('/:locationId', async (req, res, next) => {
    const userId = req.session?.userId;
    const locationId = req.params.locationId;
    const location = req.body.location;

    if (userId) {
        const locations = await getLocationsForUser(userId);
        const locationToBeUpdated = locations
            .find(location => location.id === locationId);

        if (locationToBeUpdated) {
            locationToBeUpdated.update(
                location.street,
                location.city,
                location.state,
                location.zipCode,
                location.nickname
            );
            await updateLocation(locationToBeUpdated);
        }

        const updatedLocation = getLocationById(locationId);

        res.status(200).json(await updatedLocation);
    } else {
        res.status(401).send();
    }
});

router.get('/autosuggest/:searchTerm', async (req, res, next) => {
    const userEmail = req.session?.userId;
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    const hereAutoSuggestions = await autosuggest(
        req.params.searchTerm,
        new Coordinates(latitude, longitude)
    )


    res.status(200).json(hereAutoSuggestions);
});

router.get('/distance', async (req, res, next) => {
    const startLatitude = Number(req.query.startLatitude);
    const startLongitude = Number(req.query.startLongitude);
    const endLatitude = Number(req.query.endLatitude);
    const endLongitude = Number(req.query.endLongitude);

    const startCoordinates = new Coordinates(startLatitude, startLongitude);
    const endCoordinates = new Coordinates(endLatitude, endLongitude);

    const distance = (await routeDistanceInMiles(startCoordinates, endCoordinates));
    res.status(200).json({distance})
});

export default router;