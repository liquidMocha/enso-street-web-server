import {UserProfile} from "./UserProfile";
import {User} from "../user/User";
import database from '../database.js';
import UserRepository from "../user/UserRepository";
import Contact from "./Contact";

export const save = async (userProfile: UserProfile, user: User) => {
    return database.none(`
        INSERT INTO public.user_profile(id, name, user_id)
        VALUES ($1, $2, $3)`, [userProfile.id, userProfile.name, user.id])
}

export const update = async (userProfile: UserProfile) => {
    return database.tx('update user profile', t => {
        const updateProfile = t.none(`
            UPDATE public.user_profile
            SET name = $1
            WHERE user_id = $2
        `, [userProfile.name, userProfile.user.id])

        const updateContacts = userProfile.contacts.map(async contact => {
            await t.none(
                    `DELETE
                     FROM public.contact
                     WHERE user_profile_id = $1`, [userProfile.id]
            );

            return t.none(
                    `
                        INSERT INTO public.contact (first_name, last_name, phone, email, user_profile_id)
                        VALUES ($1, $2, $3, $4, $5)
                `, [contact.firstName, contact.lastName, contact.phone, contact.email, userProfile.id]
            )
        })

        return Promise.all([updateProfile, ...updateContacts])
    });

}

export const getUserProfile = async (userId: string): Promise<UserProfile> => {
    const user = UserRepository.getUser(userId);
    const profileEntity = await database.oneOrNone(`
                SELECT up.id, up.name
                FROM public."user" u
                         JOIN user_profile up on u.id = up.user_id
                WHERE u.id = $1
        `,
        [userId],
        async profile => {
            profile.contacts = await database.manyOrNone(`
                SELECT *
                FROM contact
                WHERE user_profile_id = $1
            `, [profile.id])
            return profile;
        });

    return new UserProfile({
        id: profileEntity.id,
        name: profileEntity.name,
        contact: profileEntity.contacts.map((contact: any) => {
            return new Contact({
                firstName: contact.first_name,
                lastName: contact.last_name,
                phone: contact.phone,
                email: contact.email
            })
        }),
        user: await user
    })


}
