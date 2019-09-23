import passport from "passport";
import UserService from "./user/UserService";
import * as bcrypt from "bcrypt";
import authenticationMiddleware from "./authenticationMiddleware";

const LocalStrategy = require('passport-local').Strategy;

const setupPassport = () => {
    passport.use('local', new LocalStrategy({usernameField: 'email'},
        (email, password, done) => {
            UserService.findOne({username: email})
                .then((user) => {
                    if (!user) {
                        return done(null, false, {message: 'Email doesn\'t exist.'});
                    }

                    bcrypt.compare(password, user.password, function (err, match) {
                        if (match) {
                            done(null, user);
                        } else {
                            done(null, false, {message: 'Incorrect password.'});
                        }
                    });
                })
                .catch(done);
        }));

    passport.authenticationMiddleware = authenticationMiddleware;
};

export default setupPassport