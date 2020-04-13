export default class Address {
    readonly street: string;
    readonly city: string;
    readonly state: string;
    readonly zipCode: string;

    constructor(
        {street, city, state, zipCode}: { street: string, city: string, state: string, zipCode: string },
    ) {
        this.street = street;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
    }
}
