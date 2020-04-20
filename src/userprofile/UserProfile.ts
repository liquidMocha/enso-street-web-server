import {uuid} from "uuidv4";
import {User} from "../user/User";
import Contact from "./Contact";
import Location from "../location/Location";

export class UserProfile {
    get defaultLocation(): Location | undefined {
        return this._defaultLocation;
    }

    set defaultLocation(value: Location | undefined) {
        this._defaultLocation = value;
    }

    readonly id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    private _defaultLocation?: Location;
    readonly user: User;
    readonly contacts: Contact[];

    constructor({
                    id,
                    name,
                    firstName,
                    lastName,
                    phone,
                    email,
                    defaultLocation,
                    user,
                    contact
                }: {
                    id: string,
                    name: string,
                    firstName?: string,
                    lastName?: string,
                    phone?: string,
                    email?: string,
                    defaultLocation?: Location,
                    user: User,
                    contact: Contact[]
                }
    ) {
        this.id = id;
        this.name = name;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.email = email;
        this._defaultLocation = defaultLocation;
        this.user = user;
        this.contacts = contact;
    }

    static create(name: string, email: string, user: User): UserProfile {
        return new UserProfile({contact: [], id: uuid(), name: name, user: user, email: email});
    }

    addContact(contact: Contact) {
        const existingContact = this.contacts.find(contact => this.id === contact.id);
        if (existingContact) {
            existingContact.updateFirstName(contact.firstName);
            existingContact.updateLastName(contact.lastName);
            existingContact.updatePhone(contact.phone);
            existingContact.updateEmail(contact.email);
        } else {
            this.contacts.push(contact);
        }
    }

    updateFirstName(firstName: string) {
        this.firstName = firstName;
    }

    updateLastName(lastName: string) {
        this.lastName = lastName;
    }

    updatePhone(phone: string) {
        this.phone = phone;
    }

    updateEmail(email: string) {
        this.email = email;
    }

    updateProfileName(name: string) {
        this.name = name;
    }
}
