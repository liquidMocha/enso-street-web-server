import passport from "passport";
import UserService from "./user/UserService";
import * as bcrypt from "bcrypt";

const LocalStrategy = require('passport-local').Strategy;

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

    passport.serializeUser(function (user, done) {
        done(null, user.email);
    });

    passport.deserializeUser(function (username, done) {
        console.log("in passport deserializer: ", username);
        UserService.findOne({username: username})
            .then((user) => {
                done(null, user);
            })
            .catch((error) => {
                done(error, null);
            });
    });
};

export default setupPassport