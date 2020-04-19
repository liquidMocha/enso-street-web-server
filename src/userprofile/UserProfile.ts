import {uuid} from "uuidv4";
import {User} from "../user/User";
import Contact from "./Contact";

export class UserProfile {
    readonly id: string;
    name: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    email?: string;
    readonly user: User;
    readonly contacts: Contact[];

    constructor({id, name, firstName, lastName, phone, email, user, contact}:
                    { id: string, name: string, firstName?: string, lastName?: string, phone?: string, email?: string, user: User, contact: Contact[] }) {
        this.id = id;
        this.name = name;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.email = email;
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
