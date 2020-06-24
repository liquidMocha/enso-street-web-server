import {createNewEnsoUser} from "./UserFactory"
import {save as saveUserProfile} from "../userprofile/UserProfileRepository";
import UserRepository from "./UserRepository";
import {OAuth2Client} from "google-auth-library";
import {UserProfile} from "../userprofile/UserProfile";
import bcrypt from "bcrypt";
import GoogleSignOnResponse from "./GoogleSignOnResponse";
import {sendPasswordResetEmail, sendWelcomeEmail} from "../email/SendGridClient";
import jose from "jose";

export const createEnsoUser = async (name: string, password: string, email: string) => {
    const user = createNewEnsoUser(email);
    const userProfile = UserProfile.create(name, email, user);

    //TODO: single unit of work
    await UserRepository.saveEnsoUser(user, password);
    await saveUserProfile(userProfile, user);

    sendWelcomeEmail(email);
};

export const updatePasswordFor = async (userId: string, password: string) => {
    return UserRepository.updatePasswordFor(userId, password);
}

export const passwordMatch = async (incomingPassword: string, existingPassword: string) => {
    return await bcrypt.compare(incomingPassword, existingPassword);
}

export const ensoLogin = async (email: string, password: string) => {
    const user = await UserRepository.findOneUser({email});
    if (user) {
        const existingPassword = UserRepository.getPasswordHashForUser(user.id);
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

const passwordResetTokenExpiration = process.env.PASSWORD_RESET_TOKEN_EXPIRATION;
const passwordResetLinkBaseUrl = process.env.PASSWORD_RESET_BASEURL;

export const initiateForgetPassword = async (userEmail: string) => {
    const user = await UserRepository.findOneUser({email: userEmail});
    if (user) {
        const passwordHash = await UserRepository.getPasswordHashForUser(user.id);
        const resetToken = jose.JWT.sign({id: user.id}, passwordHash, {expiresIn: "1 hour"});
        return sendPasswordResetEmail(user.email, `${passwordResetLinkBaseUrl}?token=${resetToken}`);
    } else {
        throw Error(`User ${userEmail} does not exist.`)
    }
}
