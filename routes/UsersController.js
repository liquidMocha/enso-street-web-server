import UsersService from "../user/UserService";
import express from "express";
import * as bcrypt from "bcrypt";

const router = express.Router();

/* GET users listing. */
router.get('/', function (req, res, next) {
    res.send('respond with a resource');
});

router.post('/createUser', (req, res, next) => {
    const saltRounds = 14;
    const name = req.body.name;
    const password = req.body.password;
    const email = req.body.email;
    bcrypt.hash(password, saltRounds, (error, hash) => {
        UsersService.createUser(name, hash, email);
    });
    res.status(201);
    res.send();
});

router.post('/login', async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    UsersService.getPasswordForUser(email).then((hashedPassword) => {
        bcrypt.compare(password, hashedPassword, function (err, match) {
            if (match) {
                res.status(200).send('authentication successful');
            } else {
                res.status(401).send('authentication failed');
            }
        });
    });
});

export default router;
