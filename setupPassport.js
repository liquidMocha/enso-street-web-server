import passport from "passport";
import UserService from "./user/UserService";
import * as bcrypt from "bcrypt";

const LocalStrategy = require('passport-local').Strategy;
const GoogleStrategy = require('passport-google-oauth20').Strategy;

const setupPassport = () => {
    passport.serializeUser((user, done) => {
        done(null, user.email);
    });

    passport.deserializeUser((username, done) => {
        UserService.findOne({email: username})
            .then((user) => {
                done(null, user);
            })
            .catch((error) => {
                done(null);
            });
    });

    passport.use('local', new LocalStrategy({usernameField: 'email', passwordField: 'password'},
        (email, password, done) => {
            UserService.findOne({email: email})
                .then((user) => {
                    bcrypt.compare(password, user.password, (err, match) => {
                        if (match) {
                            done(null, user);
                        } else {
                            done(null, false, {message: 'Incorrect password.'});
                        }
                    });
                })
                .catch(error => {
                    done(error, null, {message: 'User doesn\'t exist.'});
                });
        }));

    passport.use('googleSignOn', new GoogleStrategy({
            clientID: process.env.googleClientId,
            clientSecret: process.env.googleClientSecret,
            callbackUrl: process.env.googleSignOnCallbackUrl
        },
        (accessToken, refreshToken, profile, cb) => {
            UserService.findOrCreate({profile: profile})
                .then(user => {
                    return cb(null, user);
                })
                .catch(error => {
                        return cb(error, null);
                    }
                );

        }));
};

export default setupPassport