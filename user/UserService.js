import {create} from "./UserFactory"
import UserRepository from "./UserRepository";
import {OAuth2Client} from "google-auth-library";

export const createEnsoUser = (name, password, email) => {
    const user = create(name, password, email);
    return UserRepository.saveEnsoUser(user)
};

export const ensoLogin = async (email, password) => {
    const user = await UserRepository.findOne({email});
    if (user) {
        const loginSuccessful = await user.login(password);
        await UserRepository.update(user);
        return loginSuccessful;
    } else {
        return false;
    }
};

const CLIENT_ID = process.env.googleClientId;
const googleOAuthClient = new OAuth2Client(CLIENT_ID);

export const googleSignOn = async (idToken) => {
    const ticket = await googleOAuthClient.verifyIdToken({
        idToken: idToken,
        audience: CLIENT_ID
    });

    const payload = ticket.getPayload();
    const userEmail = payload.email;
    const userName = payload.name;

    const user = create(userName, null, userEmail);

    return await UserRepository.findOrCreate(user);
};

export const checkLoggedIn = async (email) => {
    const user = await UserRepository.findOne({email});
    return !!user;
};

export const getUser = async (userId) => {
    return UserRepository.getUser(userId);
};
