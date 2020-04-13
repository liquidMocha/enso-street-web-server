export default class Location {
    readonly id: string;
    readonly street: string;
    readonly city: string;
    readonly state: string;
    readonly zipCode: string;
    readonly nickname: string;

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
}
