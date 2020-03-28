import {create} from "./UserFactory"
import UserRepository from "./UserRepository";

export const createEnsoUser = (name, password, email) => {
    const user = create(name, password, email);
    return UserRepository.createEnsoUser1(user)
};
