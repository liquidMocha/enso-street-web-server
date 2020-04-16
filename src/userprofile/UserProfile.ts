import {uuid} from "uuidv4";
import {User} from "../user/User";
import Contact from "./Contact";

export class UserProfile {
    readonly id: string;
    readonly name: string;
    readonly user: User;
    readonly contacts: Contact[];

    constructor({id, name, user, contact}: { id: string, name: string, user: User, contact: Contact[] }) {
        this.id = id;
        this.name = name;
        this.user = user;
        this.contacts = contact;
    }

    static create(name: string, email: string, user: User): UserProfile {
        return new UserProfile({contact: [], id: uuid(), name: name, user: user});
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
}
