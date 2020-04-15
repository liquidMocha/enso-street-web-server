import {uuid} from "uuidv4";
import {User} from "./User";

export class UserProfile {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly user: User;

    constructor({id, name, email, user}: { id: string, name: string, email: string, user: User }) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.user = user;
    }

    static create(name: string, email: string, user: User): UserProfile {
        return new UserProfile({id: uuid(), name: name, email: email, user: user});
    }
}
