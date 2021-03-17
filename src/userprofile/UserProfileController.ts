import express, {Request, Response} from "express";
import {getUserAliasById, getUserProfileByUserId, update} from "./UserProfileRepository";
import Contact from "./Contact";
import {uuid} from "uuidv4";
import Location from "../location/Location";
import {requireAuthentication} from "../user/AuthenticationCheck";
import {getUserProfile} from "./UserProfileService";

const router = express.Router();

router.get('/', requireAuthentication, fetchUserProfile);
router.put('/', requireAuthentication, updateProfile);
router.put('/contact', requireAuthentication, addContact);
router.get('/:userId/alias', getUserAlias);

async function getUserAlias(req: Request, res: Response) {
    const userId = req.params.userId;
    const alias = await getUserAliasById(userId);

    res.status(200).json(alias);
}

async function fetchUserProfile(req: Request, res: Response) {
    const userId = req.session?.userId;

    const userProfileDto = await getUserProfile(userId);

    res.status(200).json(userProfileDto);
}

async function updateProfile(req: Request, res: Response) {
    const userId = req.session?.userId;
    const updatedProfileDto: UpdateProfileDto = req.body.profile;

    const userProfile = await getUserProfileByUserId(userId);
    userProfile.updateFirstName(updatedProfileDto.firstName);
    userProfile.updateLastName(updatedProfileDto.lastName);
    userProfile.updatePhone(updatedProfileDto.phone);
    userProfile.updateEmail(updatedProfileDto.email);
    userProfile.updateProfileName(updatedProfileDto.profileName);

    await update(userProfile);
    res.status(200).send();
}

async function addContact(req: Request, res: Response) {
    const userId = req.session?.userId;
    const contactDto = req.body.contact;

    const userProfile = await getUserProfileByUserId(userId);
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
    const userProfile = await getUserProfileByUserId(userId);
    if (userProfile.defaultLocation == null) {
        userProfile.defaultLocation = location;
    }

    return update(userProfile);
}

export default router;
