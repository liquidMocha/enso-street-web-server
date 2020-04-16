import {createNewEnsoUser} from "./UserFactory"
import {save as saveUserProfile} from "../userprofile/UserProfileRepository";
import UserRepository from "./UserRepository";
import {OAuth2Client} from "google-auth-library";
import {UserProfile} from "../userprofile/UserProfile";
import bcrypt from "bcrypt";
import GoogleSignOnResponse from "./GoogleSignOnResponse";

export const createEnsoUser = async (name: string, password: string, email: string) => {
    const user = createNewEnsoUser(email);
    const userProfile = UserProfile.create(name, email, user);

    //TODO: single unit of work
    await UserRepository.saveEnsoUser(user, password)
    await saveUserProfile(userProfile, user)
};

const passwordMatch = async (incomingPassword: string, existingPassword: string) => {
    return await bcrypt.compare(incomingPassword, existingPassword);
}

export const ensoLogin = async (email: string, password: string) => {
    const user = await UserRepository.findOneUser({email});
    if (user) {
        const existingPassword = UserRepository.getPasswordForUser(user.id);
        const loginSuccessful = await passwordMatch(password, await existingPassword);
        if (loginSuccessful) {
            user.loginSucceeded();
        } else {
            user.loginFailed();
        }
        await UserRepository.update(user);
        return loginSuccessful;
    } else {
        return false;
    }
};

const CLIENT_ID = process.env.googleClientId;
const googleOAuthClient = new OAuth2Client(CLIENT_ID);

export const googleSignOn = async (idToken: string): Promise<GoogleSignOnResponse> => {
    const ticket = await googleOAuthClient.verifyIdToken({
        idToken: idToken,
        audience: CLIENT_ID!
    });

    const payload = ticket.getPayload();
    if (payload && payload.email && payload.name) {
        const userEmail = payload.email;
        const userName = payload.name;

        return new GoogleSignOnResponse(userEmail, userName);
    } else {
        return Promise.reject(`Google Sign On failed for ID token: ${idToken}`);
    }
};

export const userExists = async (id: string): Promise<boolean> => {
    return await UserRepository.userExists(id);
};

export const getUser = async (userId: string) => {
    return UserRepository.getUser(userId);
};
