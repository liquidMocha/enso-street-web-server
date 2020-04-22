import express, {NextFunction, Request, Response} from "express";
import {getUserProfile, update} from "./UserProfileRepository";
import Contact from "./Contact";
import {uuid} from "uuidv4";
import Location from "../location/Location";
import {toDto} from "./UserProfileMapper";
import {requireAuthentication} from "../user/AuthenticationCheck";

const router = express.Router();

router.get('/', requireAuthentication, fetchUserProfile);

async function fetchUserProfile(req: Request, res: Response, next: NextFunction) {
    const userId = req.session?.userId;
    const userProfile = await getUserProfile(userId);
    const userProfileDto = toDto(userProfile);
    res.status(200).json(userProfileDto);
}

router.put('/', requireAuthentication, updateProfile);

async function updateProfile(req: Request, res: Response, next: NextFunction) {
    const userId = req.session?.userId;
    const updatedProfileDto: UpdateProfileDto = req.body.profile;

    const userProfile = await getUserProfile(userId);
    userProfile.updateFirstName(updatedProfileDto.firstName);
    userProfile.updateLastName(updatedProfileDto.lastName);
    userProfile.updatePhone(updatedProfileDto.phone);
    userProfile.updateEmail(updatedProfileDto.email);
    userProfile.updateProfileName(updatedProfileDto.profileName);

    await update(userProfile);
    res.status(200).send();
}

router.put('/contact', requireAuthentication, addContact);

async function addContact(req: Request, res: Response, next: NextFunction) {
    const userId = req.session?.userId;
    const contactDto = req.body.contact;

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
}

export const InitializeDefaultLocation = async (userId: string, location: Location) => {
    const userProfile = await getUserProfile(userId);
    if (userProfile.defaultLocation == null) {
        userProfile.defaultLocation = location;
    }

    return update(userProfile);
}

export default router;
