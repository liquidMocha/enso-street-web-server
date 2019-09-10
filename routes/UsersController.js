import UsersService from "../user/UserService";
import express from "express";

const router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send('respond with a resource');
});

router.post('/createUser', (req, res, next) => {
  const name = req.body.name;
  const password = req.body.password;
  const email = req.body.email;
  UsersService.createUser(name, password, email);
  res.status(201);
  res.send();
});

export default router;
