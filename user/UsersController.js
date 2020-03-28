import UsersService from "./UserRepository";
import {createEnsoUser, ensoLogin} from "./UserService";
import express from "express";
import {OAuth2Client} from "google-auth-library";
import Joi from "@hapi/joi";

const router = express.Router();

router.post('/createUser', async (req, res) => {
    const schema = Joi.object({
        email: Joi.any(),
        name: Joi.any(),
        password: Joi.string().min(8)
    });

    try {
        const validatedValue = await schema.validateAsync(req.body);
        await createEnsoUser(validatedValue.name, validatedValue.password, validatedValue.email);
        res.status(201).send();
    } catch (e) {
        console.log(e);
        res.status(500).send();
    }
});

router.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const loginSuccessful = await ensoLogin(email, password);

        if (loginSuccessful) {
            req.session.email = email;
            res.status(200).send('authentication successful');
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
        const ticket = await googleOAuthClient.verifyIdToken({
            idToken: req.body.idToken,
            audience: CLIENT_ID
        });

        const payload = ticket.getPayload();
        const userEmail = payload.email;
        const userName = payload.name;

        const user = await UsersService.findOrCreate({email: userEmail, name: userName});

        req.session.email = user.email;
        res.status(200).send('Google signon successful');
    } catch (e) {
        console.error(`Error when Google Signon: ${e}`);
        res.status(500).send();
    }
});

router.post('/isLoggedIn', (req, res) => {
    res.setHeader('Last-Modified', (new Date()).toUTCString());

    if (req.session.email) {
        res.status(200).json({loggedIn: true});
    } else {
        res.status(200).json({loggedIn: false});
    }
});

router.get('/logout', (req, res) => {
    console.log(`User ${req.session.email} logging out.`);

    req.session.destroy(error => {
        if (error) {
            console.log(error);
        }
    });
    res.status(200).send();
});

export default router;
