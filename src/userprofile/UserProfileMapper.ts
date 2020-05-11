import {UserProfile} from "./UserProfile";
import {UserProfileDto} from "./UserProfileDto";

export const toDto = (profile: UserProfile): UserProfileDto => {
    return {
        id: profile.id,
        name: profile.name,
        firstName: profile.firstName,
        lastName: profile.lastName,
        phone: profile.phone,
        email: profile.email,
        defaultAddress: profile.defaultLocation ? {
            id: profile.defaultLocation.id,
            street: profile.defaultLocation.street,
            city: profile.defaultLocation.city,
            state: profile.defaultLocation.state,
            zipCode: profile.defaultLocation.zipCode,
            nickname: profile.defaultLocation.nickname,
        } : undefined,
        user: {
            id: profile.user.id,
            email: profile.user.email
        },
        contacts: profile.contacts.map(contact => {
            return {
                id: contact.id,
                firstName: contact.firstName,
                lastName: contact.lastName,
                phone: contact.phone,
                email: contact.email,
            }
        })
    }
}
