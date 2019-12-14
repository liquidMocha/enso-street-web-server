export default class Location {
    constructor({
                    id: id,
                    street: street,
                    city: city,
                    state: state,
                    zipCode: zipCode,
                    nickname: nickname
                }) {
        this.id = id;
        this.street = street;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.nickname = nickname;
    }
}
