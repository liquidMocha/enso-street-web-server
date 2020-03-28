import {UserProfile} from "./UserProfile";
import {User} from "./User";

export const create = (name, password, email) => {
    return new User({
        password,
        email,
        profile: new UserProfile({name})
    })
};
