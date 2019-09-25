import UsersService from "../user/UserService";
import express from "express";
import * as bcrypt from "bcrypt";
import {OAuth2Client} from "google-auth-library";

const router = express.Router();

router.post('/createUser', (req, res, next) => {
    const name = req.body.name;
    const password = req.body.password;
    const email = req.body.email;
    UsersService.createEnsoUser(name, password, email)
        .then(() => {
            res.status(201).send();
        })
        .catch(() => {
            res.status(500).send();
        })
    ;
});

router.post('/login', (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    UsersService.findOne({email: email})
        .then((user) => {
            if (user) {
                bcrypt.compare(password, user.password, (err, match) => {
                    if (match) {
                        req.session.email = email;
                        res.status(200).send('authentication successful');
                    } else {
                        res.status(401).send('authentication failed');
                    }
                })
            } else {
                res.status(500).send();
            }
            ;
        });
});

router.post('/googleSignOn', (req, res) => {
    const CLIENT_ID = process.env.googleClientId;
    const client = new OAuth2Client(CLIENT_ID);
    const ticket = client.verifyIdToken({
        idToken: req.body.idToken,
        audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    }).then(ticket => {
        const payload = ticket.getPayload();
        const userid = payload['sub'];
        console.log('userid: ------------------------', userid);
        console.log('payload: -----------------------', payload);
    }).catch(error => console.log(error));
});

export default router;
