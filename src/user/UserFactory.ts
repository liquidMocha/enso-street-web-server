import {User} from "./User";
import {uuid} from "uuidv4";
import UserDAO from "./UserDAO";

export const createNewEnsoUser = (email: string): User => {
    return new User({
        id: uuid(),
        email: email,
        createdOn: new Date(),
        failedAttempts: 0,
    })
};
export const reconstitueEnsoUser = (userDao: UserDAO): User => {
    return new User({
        id: userDao.id,
        email: userDao.email,
        createdOn: userDao.createdOn,
        failedAttempts: userDao.failedAttempts,
    });
};
