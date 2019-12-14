import express from "express";
import LocationRepository from "../location/LocationRepository";
import UserService from "../user/UserService";

const router = express.Router();

router.get('/', (req, res, next) => {
    if (req.session.email) {
        UserService.findOne({email: req.session.email})
            .then(user => {
                if (user) {
                    LocationRepository.getLocationsForUser(user.id)
                        .then(locations => {
                            res.status(200).json(locations);
                        });
                } else {
                    res.status(404).send();
                }
            })
    } else {
        res.status(401).send();
    }
});

router.put('/', (req, res, next) => {
    const userEmail = req.session.email;
    if (req.session.email) {
        UserService.findOne({email: userEmail})
            .then(user => {
                if (user) {
                    return LocationRepository.createLocation(req.body.location, user.id);
                } else {
                    res.status(401).send();
                }
            })
            .then(locationId => {
                res.status(201).json(locationId);
            });
    } else {
        res.status(401).send();
    }
});

export default router;