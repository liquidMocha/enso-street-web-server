import database from '../database';
import * as bcrypt from "bcrypt";

export default class UserService {
    static findOne = ({username: username}) => {
        return database.oneOrNone(
            "select * from public.user where email = $1", [username]);
    };

    static createUser = async (name, password, email) => {
        const saltRounds = 14;

        let hash = await bcrypt.hash(password, saltRounds);

        return database.none(
            "insert into public.user(name, password, email, created_on) " +
            "values ($1, $2, $3, $4)",
            [name, hash, email, new Date().toISOString().slice(0, 19).replace('T', ' ')]);
    };
}