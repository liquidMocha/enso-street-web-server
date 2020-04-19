import express from "express";
import {getUserProfile, update} from "./UserProfileRepository";
import Contact from "./Contact";
import {uuid} from "uuidv4";

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

async function updateProfile(req: any, res: any, next: any) {
    interface UpdateProfileDto {
        profileName: string,
        firstName: string,
        lastName: string,
        phone: string,
        email: string
    }

    const userId = req.session?.userId;
    const updatedProfileDto: UpdateProfileDto = req.body.profile;

    if (userId) {
        const userProfile = await getUserProfile(userId);
        userProfile.updateFirstName(updatedProfileDto.firstName);
        userProfile.updateLastName(updatedProfileDto.lastName);
        userProfile.updatePhone(updatedProfileDto.phone);
        userProfile.updateEmail(updatedProfileDto.email);
        userProfile.updateProfileName(updatedProfileDto.profileName);

        await update(userProfile);
        res.status(200).send();
    } else {
        res.status(401).send();
    }
}

router.put('/', updateProfile);

router.put('/contact', async (req, res, next) => {
    const userId = req.session?.userId;
    const contactDto = req.body.contact;

    if (userId) {
        const userProfile = await getUserProfile(userId);
        userProfile.addContact(new Contact({
            id: contactDto.id || uuid(),
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
