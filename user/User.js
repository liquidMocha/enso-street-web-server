import * as bcrypt from "bcrypt";

export class User {
    constructor({
                    id: id,
                    password: password,
                    email: email,
                    createdOn: createdOn,
                    failedAttempts: failedAttempts,
                    profile: profile
                }) {
        this.password = password;
        this.email = email;
        this.createdOn = createdOn;
        this.profile = profile;
        this.id = id;
        this.failedAttempts = failedAttempts;
    }

    login = async (password) => {
        try {
            const match = await bcrypt.compare(password, this.password);

            if (match) {
                this.failedAttempts = 0;
                return true;
            } else {
                this.failedAttempts++;
                return false;
            }
        } catch (error) {
            console.error(error)
        }
    }
}
