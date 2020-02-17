import database from '../database';
import Location from './Location';

export const createLocation = (location, userId) => {
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

export const updateLocation = (location, userId) => {
    return database.one(
            `UPDATE public.location
             SET street   = $1,
                 zipcode  = $2,
                 city     = $3,
                 state    = $4,
                 nickname = $5
             WHERE id = $6
             RETURNING id, street, zipcode, city, state, nickname`,
        [location.street, location.zipCode, location.city, location.state, location.nickname, location.id]
    ).then(data => {
        return new Location({
            id: data.id,
            street: data.street,
            city: data.city,
            state: data.state,
            zipCode: data.zipcode,
            nickname: data.nickname
        })
    }).catch(error => {
        throw new Error(`Error updating location ${location.id}: ${error}`)
    })
};

export const getLocationsForUser = (userId) => {
    return database.manyOrNone(
            `SELECT id, street, zipcode, city, state, nickname
             FROM public.location
             WHERE "user" = $1`,
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
};
