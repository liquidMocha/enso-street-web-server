import express from "express";
import Location from '../location/Location';
import LocationService from "../location/LocationService";

const router = express.Router();

router.post('/addLocation', (req, res, next) => {
    if (req.session.email) {
        const locationPayload = req.body;
        const locationToCreate = new Location({
            nickname: locationPayload.nickname,
            address: locationPayload.address,
            city: locationPayload.city,
            state: locationPayload.state,
            zipCode: locationPayload.zipCode
        });

        LocationService.addLocationForUser({location: locationToCreate, email: req.session.email});
        res.status(201).send();
    } else {
        res.status(401).send();
    }
});

export default router;