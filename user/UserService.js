import {create} from "./UserFactory"
import UserRepository from "./UserRepository";
import {OAuth2Client} from "google-auth-library";

export const createEnsoUser = (name, password, email) => {
    const user = create(name, password, email);
    return UserRepository.createEnsoUser1(user)
};

export const ensoLogin = async (email, password) => {
    const user = await UserRepository.findOne({email});
    if (user) {
        return user.login(password);
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

    return await UserRepository.findOrCreate({email: userEmail, name: userName});
};

export const checkLoggedIn = async (email) => {
    const user = await UserRepository.findOne({email});
    return !!user;
};
