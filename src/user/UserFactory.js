import {UserProfile} from "./UserProfile";
import {User} from "./User";

export const create = (name, password, email) => {
    return new User({
        password,
        email,
        profile: new UserProfile({name})
    })
};

export const reconstitueFromDao = ({userDao}) => {
    return new User({
        id: userDao.userid,
        password: userDao.password,
        email: userDao.email,
        failedAttempts: userDao.failed_login_attempts,
        profile: new UserProfile({name: userDao.name})
    });
};
