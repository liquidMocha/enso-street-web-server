export default class HereAutoSuggestion {
    private houseNumber?: string;
    private street: string;
    private city: string;
    private state: string;
    private zipCode: string;

    constructor(
        {houseNumber, street, city, state, zipCode}: { houseNumber?: string, street: string, city: string, state: string, zipCode: string },
    ) {
        this.houseNumber = houseNumber;
        this.street = street;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
    }
}
