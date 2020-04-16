import {uuid} from "uuidv4";

export default class Contact {
    readonly id: string;
    readonly firstName: string;
    readonly lastName: string;
    readonly phone: string;
    readonly email: string;

    constructor({id, firstName, lastName, phone, email}: { id: string | null, firstName: string, lastName: string, phone: string, email: string }) {
        this.id = id || uuid();
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.email = email;
    }
}
