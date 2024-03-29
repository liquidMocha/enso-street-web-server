import express, {NextFunction, Request, Response} from "express";
import Location from './Location';
import {createLocation, getLocationById, getLocationsForUser, updateLocation} from "./LocationRepository";
import {autosuggest, routeDistanceInMiles} from "./HereApiClient";
import {Coordinates} from "./Coordinates";
import {InitializeDefaultLocation} from "../userprofile/UserProfileController";
import {requireAuthentication} from "../user/AuthenticationCheck";

const router = express.Router();

router.get('/', requireAuthentication, getAddressBook);
router.put('/', requireAuthentication, addLocation);
router.put('/:locationId', requireAuthentication, updateLocationById);
router.get('/autosuggest/:searchTerm', locationAutoSuggest);
router.get('/distance', calculateDistance);

async function getAddressBook(req: Request, res: Response, next: NextFunction) {
    const userId = req.session?.userId;
    const locations = await getLocationsForUser(userId);
    res.status(200).json(locations);
}

async function addLocation(req: Request, res: Response, next: NextFunction) {
    const userId = req.session?.userId;

    const location = Location.create(
        req.body.location.street,
        req.body.location.city,
        req.body.location.state,
        req.body.location.zipCode,
        req.body.location.nickname
    )

    await createLocation(location, userId);
    await InitializeDefaultLocation(userId, await getLocationById(location.id));

    res.status(201).json(location.id);
}

async function updateLocationById(req: Request, res: Response, next: NextFunction) {
    const userId = req.session?.userId;
    const locationId = req.params.locationId;
    const location = req.body.location;

    const locations = await getLocationsForUser(userId);
    const locationToBeUpdated = locations.find(location => location.id === locationId);

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
}

async function locationAutoSuggest(req: Request, res: Response, next: NextFunction) {
    const latitude = Number(req.query.latitude);
    const longitude = Number(req.query.longitude);

    const hereAutoSuggestions = await autosuggest(
        req.params.searchTerm,
        new Coordinates(latitude, longitude)
    )

    res.status(200).json(hereAutoSuggestions);
}

async function calculateDistance(req: Request, res: Response, next: NextFunction) {
    const startLatitude = Number(req.query.startLatitude);
    const startLongitude = Number(req.query.startLongitude);
    const endLatitude = Number(req.query.endLatitude);
    const endLongitude = Number(req.query.endLongitude);

    const startCoordinates = new Coordinates(startLatitude, startLongitude);
    const endCoordinates = new Coordinates(endLatitude, endLongitude);

    const distance = (await routeDistanceInMiles(startCoordinates, endCoordinates));
    res.status(200).json({distance})
}

export default router;
