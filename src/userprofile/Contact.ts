import {uuid} from "uuidv4";

export default class Contact {
    readonly id: string;
    firstName: string;
    lastName: string;
    phone: string;
    email: string;

    constructor({id, firstName, lastName, phone, email}: { id: string | null, firstName: string, lastName: string, phone: string, email: string }) {
        this.id = id || uuid();
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.email = email;
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
}
