export default class GoogleSignOnResponse {
    get name(): string {
        return this._name;
    }

    get email(): string {
        return this._email;
    }

    private readonly _email: string;
    private readonly _name: string;

    constructor(email: string, name: string) {
        this._email = email;
        this._name = name;
    }
}
