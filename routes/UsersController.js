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

export default router;
