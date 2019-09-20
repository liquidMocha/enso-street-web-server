import database from '../database';
import * as bcrypt from "bcrypt";

export default class UserService {
    static createUser = async (name, password, email) => {
        const saltRounds = 14;

        await bcrypt.hash(password, saltRounds, (error, hash) => {
            database.none("insert into public.user(name, password, email, created_on) values ($1, $2, $3, $4)", [name, hash, email, new Date().toISOString().slice(0, 19).replace('T', ' ')])
            .then(function () {})
            .catch(function(error) {
                console.log('Errored when trying to save user. \n', error);
            });
        });
    };

    static getPasswordForUser = async (email) => {
        return await database.any("select password from public.user where email = $1", [email])
            .then(function(data) {
                return data[0].password;
            })
            .catch(function(error) {
                console.log('Errored when checking password for user: ', email);
                console.log('Error is: ', error);
            })
    }
}