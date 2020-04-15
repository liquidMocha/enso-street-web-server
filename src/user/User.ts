export class User {
    readonly id: string;
    readonly email: string;
    private _failedAttempts: number;
    readonly createdOn: Date;

    constructor({id, email, createdOn, failedAttempts}: {
        id: string,
        email: string,
        createdOn: Date,
        failedAttempts: number,
    }) {
        this.id = id;
        this.email = email;
        this._failedAttempts = failedAttempts;
        this.createdOn = createdOn;
    }

    static create({id, email}: {
        id: string,
        email: string
    }): User {
        return new User({id: id, failedAttempts: 0, createdOn: new Date(), email: email})
    }

    loginFailed = () => {
        this._failedAttempts++;
    }

    loginSucceeded = () => {
        this._failedAttempts = 0;
    }

    get failedAttempts(): number {
        return this._failedAttempts;
    }

}
