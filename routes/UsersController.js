import UsersService from "../user/UserService";
import express from "express";
import * as bcrypt from "bcrypt";
import {OAuth2Client} from "google-auth-library";
import Joi from "@hapi/joi";

const router = express.Router();

router.post('/createUser', (req, res) => {
    const schema = Joi.object({
        email: Joi.any(),
        name: Joi.any(),
        password: Joi.string().min(8)
    });

    schema.validateAsync(req.body)
        .then(value => {
            return UsersService.createEnsoUser(value.name, value.password, value.email);
        })
        .then(() => {
            res.status(201).send();
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send();
        });
});

router.post('/login', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    UsersService.findOne({email: email})
        .then((user) => {
            if (user) {
                return bcrypt.compare(password, user.password);
            } else {
                res.status(401).send('authentication failed');
                return Promise.reject('authentication failed')
            }
        })
        .then((match) => {
            if (match) {
                req.session.email = email;
                res.status(200).send('authentication successful');
            } else {
                res.status(401).send('authentication failed');
            }
        })
        .catch(error => console.log(error));
});

router.post('/googleSignOn', (req, res) => {
    const CLIENT_ID = process.env.googleClientId;
    const client = new OAuth2Client(CLIENT_ID);
    client.verifyIdToken({
        idToken: req.body.idToken,
        audience: CLIENT_ID
    }).then(ticket => {
        const payload = ticket.getPayload();
        const userEmail = payload.email;
        const userName = payload.name;
        return UsersService.findOrCreate({email: userEmail, name: userName});
    }).then(user => {
        req.session.email = user.email;
        res.status(200).send('Google signon successful');
    }).catch(error => {
        console.log(error);
        res.status(500).send();
    });
});

router.get('/logout', (req, res) => {
    req.session.destroy(error => {
        if (error) {
            console.log(error);
        }
    });
    res.status(200).send();
});

export default router;
