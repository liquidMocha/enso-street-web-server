import express from "express";
import LocationRepository from "./LocationRepository";
import UserRepository from "../user/UserRepository";
import Location from './Location';
import HereApiClient from "./HereApiClient";

const router = express.Router();

router.get('/', (req, res, next) => {
    if (req.session.email) {
        UserRepository.findOne({email: req.session.email})
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
    if (userEmail) {
        UserRepository.findOne({email: userEmail})
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

router.put('/:locationId', (req, res, next) => {
    const userEmail = req.session.email;
    const locationId = req.params.locationId;
    const location = req.body.location;

    if (userEmail) {
        UserRepository.findOne({email: userEmail})
            .then(user => {
                if (user) {
                    return LocationRepository.updateLocation(new Location(
                        {
                            id: locationId,
                            street: location.street,
                            city: location.city,
                            state: location.state,
                            zipCode: location.zipCode,
                            nickname: location.nickname
                        }
                    ), user.id);
                } else {
                    res.status(401).send();
                }
            }).then(location => {
            res.status(200).json(location);
        }).catch(error => {
            console.error(error);
            res.status(500).send();
        })
    } else {
        res.status(401).send();
    }
});

router.get('/autosuggest/:searchTerm', (req, res, next) => {
    const userEmail = req.session.email;

    if (userEmail) {
        HereApiClient.autosuggest(req.params.searchTerm)
            .then(result => {
                const suggestedAddresses = result.suggestions.map(suggestion => {
                    const address = suggestion.address;
                    return {
                        street: address.street,
                        zipCode: address.postalCode,
                        city: address.city,
                        state: address.state
                    }
                });
                res.status(200).json(suggestedAddresses);
            })
            .catch(error => {
                console.error(error);
                throw new Error(`Error when getting autosuggest location.`);
            });
    } else {
        res.status(401).send();
    }
});

router.get('/reverseGeocode', (req, res, next) => {
    const queryParameters = req.query;
    HereApiClient.reverseGeocode({latitude: queryParameters.latitude, longitude: queryParameters.longitude})
        .then(result => {
            res.status(200).json(result);
        }).catch(error => {
            console.error(`Error when reverse geocoding: ${error}.`);
            res.status(500).send();
        }
    );
});

export default router;