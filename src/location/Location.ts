import {uuid} from "uuidv4";

export default class Location {
    readonly id: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    nickname: string;

    constructor(
        id: string,
        street: string,
        city: string,
        state: string,
        zipCode: string,
        nickname: string,
    ) {
        this.id = id;
        this.street = street;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.nickname = nickname;
    }

    static create(
        street: string,
        city: string,
        state: string,
        zipCode: string,
        nickname: string,
    ): Location {
        return new Location(
            uuid(),
            street,
            city,
            state,
            zipCode,
            nickname
        )
    }

    update(street: string, city: string, state: string, zipCode: string, nickname: string) {
        this.street = street;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.nickname = nickname;
    }
}
