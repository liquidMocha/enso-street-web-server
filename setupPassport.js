import passport from "passport";
import UserService from "./user/UserService";
import * as bcrypt from "bcrypt";
import authenticationMiddleware from "./authenticationMiddleware";

const LocalStrategy = require('passport-local').Strategy;

passport.serializeUser((user, done) => {
    console.log("in passport serializer: ", user);
    done(null, user.email);
});

passport.deserializeUser((username, done) => {
    console.log("in passport deserializer: ", username);
    UserService.findOne({username: username})
        .then((user) => {
            done(null, user);
        })
        .catch((error) => {
            done(null);
        });
});

const setupPassport = () => {
    passport.use('local', new LocalStrategy({usernameField: 'email'},
        (username, password, done) => {
            UserService.findOne({username: username})
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
                .catch((error) => {
                    return done(error);
                });
        }));

    passport.authenticationMiddleware = authenticationMiddleware;
};

export default setupPassport