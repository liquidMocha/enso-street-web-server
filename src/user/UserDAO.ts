export default class UserDAO {
    readonly id: string;
    readonly email: string;
    readonly failedAttempts: number;
    readonly name: string;
    readonly createdOn: Date;

    constructor({id, createdOn, email, failedAttempts, name}: { id: string, createdOn: Date, email: string, failedAttempts: number, name: string }) {
        this.id = id;
        this.createdOn = createdOn;
        this.email = email;
        this.failedAttempts = failedAttempts;
        this.name = name;
    }
}
