import database from '../database.js';
import * as bcrypt from "bcrypt";
import {reconstitueEnsoUser} from "./UserFactory";
import {User} from "./User";
import UserDAO from "./UserDAO";

const getEmailById = (userId: string): Promise<string> => {
    return database.one(
            `SELECT email
             FROM public."user"
             WHERE id = $1`, [userId]
    ).then(result => {
        return result.email;
    }).catch(error => {
        throw new Error(`Error when getting user email by ID: ${error}`)
    });
};

const findOneUser = async ({email}: { email: string }): Promise<User | null> => {
    return database.oneOrNone(
            `SELECT *, public.user.id as userId, public.user.email as accountEmail
             FROM public.user
                      LEFT JOIN public.user_profile profile
                                ON public.user.id = profile.user_id
             WHERE lower(public.user.email) = lower($1)`, [email],
        userEntity => {
            if (userEntity) {
                const userDao = new UserDAO({
                    id: userEntity.userid,
                    email: userEntity.accountemail,
                    failedAttempts: userEntity.failed_login_attempts,
                    name: userEntity.name,
                    createdOn: userEntity.creaedOn,
                })
                return reconstitueEnsoUser(userDao);
            } else {
                return null;
            }
        });
};

const getUserById = async (id: string): Promise<User> => {
    return database.one(
            `SELECT *
             FROM "user"
             WHERE id = $1;`, [id],
        userEntity => {
            const userDao = new UserDAO({
                id: userEntity.id,
                email: userEntity.email,
                failedAttempts: userEntity.failed_login_attempts,
                name: userEntity.name,
                createdOn: userEntity.creaedOn,
            })
            return reconstitueEnsoUser(userDao);
        }
    ).catch(e => {
        return Promise.reject(`Errored when getUserById: ${e.stack}.`)
    })
}

const oAuthUserExists = async (email: string): Promise<boolean> => {
    return database.one(`
                SELECT EXISTS(SELECT 1
                              FROM public."user"
                              WHERE email = $1
                                AND password IS NULL);`,
        [email], data => data.exists
    )
};

const ensoUserExists = async (email: string): Promise<boolean> => {
    return database.one(`
                SELECT EXISTS(SELECT 1
                              FROM public."user"
                              WHERE email = $1
                                AND password IS NOT NULL);`,
        [email], data => data.exists
    )
};

const emailExists = async (email: string): Promise<boolean> => {
    return database.one(`
                SELECT EXISTS(SELECT 1 FROM public."user" WHERE email = $1);`,
        [email], data => data.exists
    )
};

const userExists = async (id: string): Promise<boolean> => {
    return database.one(`
                SELECT EXISTS(SELECT 1 FROM public."user" WHERE id = $1)`,
        [id], data => data.exists
    )
}

const saveEnsoUser = async (user: User, password: string): Promise<null> => {
    const email = user.email;

    const saltRounds = 14;
    const hashedPassword = await bcrypt.hash(password, saltRounds)
    return database.none(
            `INSERT INTO public."user"(id, password, email)
             VALUES ($1, $2, $3)`,
        [user.id, hashedPassword, email])
};

const createOAuthUser = async (user: User) => {
    await database.none(`INSERT INTO public.user(id, email, created_on)
                         VALUES ($1, $2, $3)`,
        [user.id, user.email, user.createdOn]
    );
};

const getPasswordHashForUser = async (userId: string): Promise<string> => {
    return await database.one(`SELECT password
                               FROM public."user"
                               WHERE id = $1`, [userId],
        data => data.password)
}

const update = (user: User) => {
    return database.none(`
        UPDATE public.user
        SET failed_login_attempts = $1
        WHERE email = $2;
    `, [user.failedAttempts, user.email])
};

const updatePasswordFor = async (userId: string, password: string) => {
    const saltRounds = 14;
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    return database.none(`
        UPDATE "user"
        SET password = $1
        WHERE id = $2
    `, [hashedPassword, userId]);
}

const getUser = (userId: string) => {
    return database.one(`
        SELECT up.name, u.email
        FROM PUBLIC.user u
                 JOIN user_profile up on u.id = up.user_id
        WHERE u.id = $1`, [userId])
};

export default {
    getEmailById,
    findOneUser,
    oAuthUserExists,
    ensoUserExists,
    userExists,
    emailExists,
    getPasswordHashForUser,
    saveEnsoUser,
    createOAuthUser,
    update,
    getUserById,
    getUser,
    updatePasswordFor
}
