import database from '../database';
import * as bcrypt from "bcrypt";

export default class UserService {
    static findOne = ({email: email}) => {
        return database.oneOrNone(
            "select * from public.user where email = $1", [email],
            userEntity => {
                if (userEntity) {
                    return new User({
                        password: userEntity.password,
                        email: userEntity.email
                    })
                } else {
                    return null;
                }
            });
    };

    static createEnsoUser = (name, password, email) => {
        return UserService.findOne({email: email})
            .then(
                user => {
                    console.log('found user when creating user: ', user);
                    if (user) {
                        if (user.password) {
                            throw new Error('Account Exists');
                        } else {
                            UserService.updatePassword(email, password);
                        }
                    } else {
                        const saltRounds = 14;
                        bcrypt.hash(password, saltRounds)
                            .then(hashedPassword => {
                                return database.one(
                                    "insert into public.user(password, email) " +
                                    "values ($1, $2) returning id",
                                    [hashedPassword, email], user => user.id)
                            })
                            .then(id => {
                                return database.none(
                                    "insert into public.user_profile(name, user_id) " +
                                    "values ($1, $2)",
                                    [name, id])
                            })
                            .catch(error => console.log('error hashing password: ', error));
                    }
                })
            .catch((error) => {
                console.log('error creating user: ', error);
            });
    };

    static updatePassword(email, password) {
        const saltRounds = 14;
        bcrypt.hash(password, saltRounds)
            .then(hashedPassword => {
                return database.none('update public.user SET password = $1 where email = $2;', [hashedPassword, email]);
            })
            .catch(error => {
                console.log('error hashing password: ', error);
            })
    }

    static findOrCreate = ({profile: profile}) => {
        return database.task(t => {
            return t.oneOrNone("select * from public.user where email = $1", profile.email, user => user)
                .then(user => {
                    return user || t.one("insert into public.user(email) " +
                        "values ($1) returning email",
                        [profile.email])
                })
        })
    };
}

class User {
    constructor({
                    password: password,
                    email: email,
                    createdOn: createdOn,
                    profile: profile
                }) {
        this.password = password;
        this.email = email;
        this.createdOn = createdOn;
        this.profile = profile;
    }
}

class UserProfile {
    constructor({name: name}) {
        this.name = name;
    }
}