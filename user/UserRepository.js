import database from '../database';
import * as bcrypt from "bcrypt";
import {reconstitueFromDao} from "./UserFactory";

const getEmailById = (userId) => {
    return database.one(
            `SELECT email FROM public."user" WHERE id = $1`, [userId]
    ).then(result => {
        return result.email;
    }).catch(error => {
        throw new Error(`Error when getting user email by ID: ${error}`)
    });
};

const findOne = async ({email: email}) => {
    return database.oneOrNone(
            `SELECT *, public.user.id as userId 
                        FROM public.user 
                        LEFT JOIN public.user_profile profile 
                        ON public.user.id = profile.user_id 
                        WHERE lower(email) = lower($1)`, [email],
        async userEntity => {
            if (userEntity) {
                //TODO: missing test for the cart this function returns
                const cartDao = await getItemsInCart(userEntity.userid);
                return reconstitueFromDao({userDao: userEntity, cartDao: cartDao});
            } else {
                return null;
            }
        });
};

const getItemsInCart = async (renterId) => {
    return (await database.manyOrNone(`
        SELECT item, quantity
        FROM cart
        WHERE renter = $1`, [renterId])).map(data => {
        return {
            id: data.item,
            quantity: data.quantity
        }
    })
};

const saveEnsoUser = (user) => {
    const name = user.profile.name;
    const password = user.password;
    const email = user.email;

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

const findOrCreate = async (user) => {
    const email = user.email;
    const name = user.profile.name;
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

const update = (user) => {
    return database.none(`
    UPDATE public.user
    SET failed_login_attempts = $1
    WHERE email = $2;
    `, [user.failedAttempts, user.email])
};

export default {
    getEmailById,
    findOne,
    saveEnsoUser,
    findOrCreate,
    update
}
