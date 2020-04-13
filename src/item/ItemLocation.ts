import {Coordinates} from "../location/Coordinates";
import Address from "../location/Address";

export default class ItemLocation {
    readonly address: Address;
    readonly coordinates: Coordinates;

    constructor(
        address: Address,
        coordinates: Coordinates,
    ) {
        this.address = address;
        this.coordinates = coordinates;
    }

}
