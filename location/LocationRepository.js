import database from '../database';
import Location from './Location';

export default class LocationRepository {
    static createLocation = (location, userId) => {
        return database.one(
                `insert into public.location
                     (street, zipCode, city, state, nickname, "user")
                 VALUES ($1, $2, $3, $4, $5, $6)
                 returning id;`,
            [location.street, location.zipCode, location.city, location.state, location.nickname, userId]
        ).then(data => {
            return data.id;
        }).catch(error => {
            throw new Error(`Error creating location: ${error}`);
        })
    };

    static getLocationsForUser = (userId) => {
        return database.manyOrNone(
                `select id, street, zipcode, city, state, nickname
                 from public.location
                 where "user" = $1`,
            [userId]
        ).then(data => {
            return data.map(location => {
                return new Location({
                    id: location.id,
                    street: location.street,
                    city: location.city,
                    state: location.state,
                    zipCode: location.zipcode,
                    nickname: location.nickname
                });
            });
        }).catch(error => {
            throw new Error(`Error retrieving locations for user ${userId}.`);
        })
    }
}
