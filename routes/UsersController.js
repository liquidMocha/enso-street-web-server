import UsersService from "../user/UserService";
import express from "express";
import * as bcrypt from "bcrypt";

const router = express.Router();

router.post('/createUser', async (req, res, next) => {
    const name = req.body.name;
    const password = req.body.password;
    const email = req.body.email;
    await UsersService.createUser(name, password, email);
    res.status(201);
    res.send();
});

router.post('/login', async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    UsersService.getPasswordForUser(email).then((hashedPassword) => {
        bcrypt.compare(password, hashedPassword, function (err, match) {
            if (match) {
                req.session.email = email;
                res.status(200).send('authentication successful');
            } else {
                res.status(401).send('authentication failed');
            }
        });
    });
});

export default router;
