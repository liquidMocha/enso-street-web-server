export default class Contact {
    readonly firstName: string;
    readonly lastName: string;
    readonly phone: string;
    readonly email: string;

    constructor({firstName, lastName, phone, email}: { firstName: string, lastName: string, phone: string, email: string }) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.phone = phone;
        this.email = email;
    }
}
