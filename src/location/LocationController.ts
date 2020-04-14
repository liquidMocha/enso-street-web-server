import express from "express";
// @ts-ignore
import UserRepository from '../user/UserRepository';
import Location from './Location';
import {createLocation, getLocationsForUser, updateLocation} from "./LocationRepository";
import {autosuggest, routeDistanceInMiles} from "./HereApiClient";
import {Coordinates} from "./Coordinates";

const router = express.Router();

router.get('/', async (req, res, next) => {
    const userEmail = req.session?.email;
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
    const userEmail = req.session?.email;
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
    const userEmail = req.session?.email;
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

router.get('/autosuggest/:searchTerm', async (req, res, next) => {
    const userEmail = req.session?.email;
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
