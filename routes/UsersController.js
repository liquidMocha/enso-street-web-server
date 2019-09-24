import UsersService from "../user/UserService";
import express from "express";
import passport from "passport";

const router = express.Router();

router.post('/createUser', async (req, res) => {
    const name = req.body.name;
    const password = req.body.password;
    const email = req.body.email;
    UsersService.createEnsoUser(name, password, email)
        .then(() => {
            res.status(201).send();
        })
        .catch((error) => {
            console.log(error);
            res.status(500).send();
        });
});

router.post('/login',
    passport.authenticate('local'),
    (req, res) => {
        res.status(200).send('authentication successful');
    }
);

router.post('/googleSignOn',
    passport.authenticate('googleSignOn'));

export default router;
