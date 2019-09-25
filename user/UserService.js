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
            .then(user => {
                console.log('found user when creating user: ', user);
                if (user) {
                    throw new Error('Account Exists');
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

    static findOrCreate = ({email: email, name: name}) => {
        return UserService.findOne({email: email})
            .then(userEntity => {
                if (userEntity) {
                    return Promise.resolve(userEntity);
                } else {
                    database.tx(transaction => {
                        return transaction.batch([
                            transaction.one("insert into public.user(email) values ($1) returning id", email)
                                .then(data => {
                                    transaction.none("insert into public.user_profile (name, user_id) values ($1, $2)", [name, data.id])
                                })
                        ])
                    }).then(_ => {
                            return UserService.findOne({email: email});
                        }
                    )
                }
            })
            .catch(error => console.log('Error when findOrCreate user for email: ', email,
                '\n Error: ', error));
    };
}

class User {
    constructor({password: password, email: email, createdOn: createdOn, profile: profile}) {
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