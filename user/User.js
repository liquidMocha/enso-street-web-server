import * as bcrypt from "bcrypt";
import UserRepository from "./UserRepository";

export class User {
    constructor({id: id, password: password, email: email, createdOn: createdOn, profile: profile}) {
        this.password = password;
        this.email = email;
        this.createdOn = createdOn;
        this.profile = profile;
        this.id = id;
    }

    login = (password) => {
        return bcrypt.compare(password, this.password)
            .then((match) => {
                if (match) {
                    UserRepository.resetFailedAttempts(this.email);
                    return true;
                } else {
                    UserRepository.incrementFailedAttempt(this.email);
                    return false;
                }
            }).catch(error => console.error(error));
    }
}