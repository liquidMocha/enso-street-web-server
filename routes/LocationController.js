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

export default router;