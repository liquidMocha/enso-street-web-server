import database from '../database.js';
import Location from './Location';

export const createLocation = async (location, userId) => {
    try {
        const locationId = database.one(
                `insert into public.location
                     (street, zipCode, city, state, nickname, "user")
                 VALUES ($1, $2, $3, $4, $5, $6)
                 returning id;`,
            [location.street, location.zipCode, location.city, location.state, location.nickname, userId],
            data => {
                return data.id
            }
        );
        return (await locationId);
    } catch (e) {
        throw new Error(`Error creating location: ${e}`);
    }
};

export const updateLocation = async (location, userId) => {
    try {
        const updatedLocation = database.one(
                `UPDATE public.location
                 SET street   = $1,
                     zipcode  = $2,
                     city     = $3,
                     state    = $4,
                     nickname = $5
                 WHERE id = $6
                 RETURNING id, street, zipcode, city, state, nickname`,
            [location.street, location.zipCode, location.city, location.state, location.nickname, location.id]
        );

        await updatedLocation;
        return new Location({
            id: updatedLocation.id,
            street: updatedLocation.street,
            city: updatedLocation.city,
            state: updatedLocation.state,
            zipCode: updatedLocation.zipcode,
            nickname: updatedLocation.nickname
        })
    } catch (e) {
        throw new Error(`Error updating location ${location.id}: ${e}`)
    }
};

export const getLocationsForUser = async (userId) => {
    try {
        const locationEntity = database.manyOrNone(
                `SELECT id, street, zipcode, city, state, nickname
                 FROM public.location
                 WHERE "user" = $1`,
            [userId]
        );

        return (await locationEntity).map(location => {
            return new Location({
                id: location.id,
                street: location.street,
                city: location.city,
                state: location.state,
                zipCode: location.zipcode,
                nickname: location.nickname
            });
        })
    } catch (e) {
        throw new Error(`Error retrieving locations for user ${userId}: ${e}`);
    }
};
