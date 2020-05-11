export class Renter {
    readonly id: string;
    readonly fullName: string;
    readonly trusted: boolean;

    constructor(id: string, fullName: string, trusted: boolean) {
        this.id = id;
        this.fullName = fullName;
        this.trusted = trusted;
    }
}
