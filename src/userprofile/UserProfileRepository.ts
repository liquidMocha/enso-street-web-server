import {UserProfile} from "../user/UserProfile";
import {User} from "../user/User";
import database from '../database.js';

export const save = async (userProfile: UserProfile, user: User) => {
    return database.none(`
        INSERT INTO public.user_profile(id, name, user_id)
        VALUES ($1, $2, $3)`, [userProfile.id, userProfile.name, user.id])
}
