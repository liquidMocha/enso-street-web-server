import express from "express";
import {getUserProfile, update} from "./UserProfileRepository";
import Contact from "./Contact";

const router = express.Router();

router.get('/', async (req, res, next) => {
    const userId = req.session?.userId;
    if (userId) {
        const userProfile = await getUserProfile(userId);
        res.status(200).json(userProfile);
    } else {
        res.status(401).send();
    }
});

router.put('/', async (req, res, next) => {
    const userId = req.session?.userId;
    const contactDto = req.body.contact;

    if (userId) {
        const userProfile = await getUserProfile(userId);
        userProfile.addContact(new Contact({
            firstName: contactDto.firstName,
            lastName: contactDto.lastName,
            phone: contactDto.phone,
            email: contactDto.email,
        }))

        await update(userProfile)
        res.status(200).json(userProfile);
    } else {
        res.status(401).send();
    }
});

export default router;
