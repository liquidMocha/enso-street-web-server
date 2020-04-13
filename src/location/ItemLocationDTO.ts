import {Coordinates} from "./Coordinates";
import Address from "./Address";

export default class ItemLocationDTO {
    readonly address: Address;
    readonly coordinates: Coordinates;

    constructor(
        street: string,
        city: string,
        state: string,
        zipCode: string,
        coordinates: Coordinates
    ) {
        this.address = new Address(
            {street: street, city: city, state: state, zipCode: zipCode},
        )
        this.coordinates = coordinates;
    }
}
