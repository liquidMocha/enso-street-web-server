import database from '../database';
import * as bcrypt from "bcrypt";
import {User} from "./User";
import {UserProfile} from "./UserProfile";

const getEmailById = (userId) => {
    return database.one(
            `SELECT email FROM public."user" WHERE id = $1`, [userId]
    ).then(result => {
        return result.email;
    }).catch(error => {
        throw new Error(`Error when getting user email by ID: ${error}`)
    });
};

const findOne = ({email: email}) => {
    return database.oneOrNone(
            `SELECT *, public.user.id as userId 
                        FROM public.user LEFT JOIN public.user_profile profile    
                        ON public.user.id = profile.user_id 
                        WHERE lower(email) = lower($1)`, [email],
        userEntity => {
            if (userEntity) {
                return new User({
                    id: userEntity.userid,
                    password: userEntity.password,
                    email: userEntity.email,
                    profile: new UserProfile({name: userEntity.name})
                })
            } else {
                return null;
            }
        });
};

const createEnsoUser = (name, password, email) => {
    return findOne({email: email})
        .then(user => {
            if (user) {
                throw new Error('Account Exists');
            } else {
                const saltRounds = 14;
                return bcrypt.hash(password, saltRounds)
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

const findOrCreate = async ({email: email, name: name}) => {
    try {
        const userEntity = await findOne({email: email});

        if (userEntity) {
            return Promise.resolve(userEntity);
        } else {
            return createOAuthUser(email, name)
                .then(_ => {
                    return findOne({email: email});
                });
        }
    } catch (e) {
        console.log('Error when findOrCreate user for email: ', email,
            '\n Error: ', error)
    }
};

const createOAuthUser = (email, name) => {
    return database.one("insert into public.user(email) values ($1) returning id", email)
        .then(data => {
            return database.none("insert into public.user_profile (name, user_id) values ($1, $2)", [name, data.id])
        })
        .catch(error => {
            console.log(error);
        });
};

const incrementFailedAttempt = (email) => {
    return database.none("update public.user SET failed_login_attempts = failed_login_attempts + 1 where email = $1;", email);
};

const resetFailedAttempts = (email) => {
    return database.none("update public.user SET failed_login_attempts = 0 where email = $1;", email);
};

export default {
    getEmailById,
    findOne,
    createEnsoUser,
    findOrCreate,
    incrementFailedAttempt,
    resetFailedAttempts
}
