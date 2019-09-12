import database from '../database';

export default class UserService {
    static createUser = (name, password, email) => {
        database.db.none("insert into public.user(name, password, email) values ($1, $2, $3)", [name, password, email])
            .then(function () {
            })
            .catch(function(error) {
                console.log('Errored when trying to save user. ', error);
            });
    };

    static getPasswordForUser = async (email) => {
        return await database.db.any("select password from public.user where email = $1", [email])
            .then(function(data) {
                return data[0].password;
            })
            .catch(function(error) {
                console.log('Errored when checking password for user: ', email);
                console.log('Error is: ', error);
            })
    }
}