import {createEnsoUser, ensoLogin, googleSignOn, userExists} from "./UserService";
import express from "express";
import {OAuth2Client} from "google-auth-library";
import Joi from "@hapi/joi";
import UserRepository from "./UserRepository";
import {UserProfile} from "./UserProfile";
import {save as saveUserProfile} from "../userprofile/UserProfileRepository";
import {createNewEnsoUser} from "./UserFactory";

const router = express.Router();

router.post('/createUser', async (req, res) => {
    const schema = Joi.object({
        email: Joi.any(),
        name: Joi.any(),
        password: Joi.string().min(8)
    });

    try {
        const validatedValue = await schema.validateAsync(req.body);

        const userAlreadyExists = await UserRepository.emailExists(validatedValue.email);
        if (userAlreadyExists) {
            res.status(409).send();
        } else {
            await createEnsoUser(
                validatedValue.name,
                validatedValue.password,
                validatedValue.email
            );
            res.status(201).send();
        }
    } catch (error) {
        console.error(error);
        res.status(500).send();
    }
});

router.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const loginSuccessful = await ensoLogin(email, password);

        if (loginSuccessful) {
            const loggedInUser = await UserRepository.findOneUser({email: email});
            if (loggedInUser) {
                req!.session!.userId = loggedInUser?.id;
                res.status(200).send('authentication successful');
            } else {
                res.status(500).send('authentication failed');
            }
        } else {
            res.status(401).send('authentication failed');
        }
    } catch (e) {
        console.error(`Error when try to log in ${email}: ${e}`);
        res.status(500);
    }
});

const CLIENT_ID = process.env.googleClientId;
const googleOAuthClient = new OAuth2Client(CLIENT_ID);

router.post('/googleSignOn', async (req, res) => {
    try {
        const response = await googleSignOn(req.body.idToken);
        const user = createNewEnsoUser(response.email);

        if (await UserRepository.oAuthUserExists(user.email)) {
            req!.session!.userId = user.id;
            res.status(200).send();
        } else {
            if (await UserRepository.ensoUserExists(user.email)) {
                res.status(409).send();
            } else {
                const userProfile = UserProfile.create(response.name, user.email, user);

                await UserRepository.createOAuthUser(user)
                await saveUserProfile(userProfile, user)
                res.status(200).send();
            }
        }
    } catch (e) {
        console.error(`Error when Google sign on: ${e}`);
        res.status(500).send();
    }
});

router.post('/isLoggedIn', async (req, res) => {
    res.setHeader('Last-Modified', (new Date()).toUTCString());
    const userId = req.session?.userId;

    if (userId) {
        const isLoggedIn = await userExists(userId);
        res.status(200).json({loggedIn: isLoggedIn});
    } else {
        res.status(200).json({loggedIn: false});
    }
});

router.get('/logout', (req, res) => {
    console.log(`User ${req.session?.userId} logging out.`);

    req.session?.destroy(error => {
        if (error) {
            console.error(error);
        }
    });
    res.status(200).send();
});

export default router;
