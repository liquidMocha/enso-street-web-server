import database from '../database.js';
import Location from './Location';

export const createLocation = async (location: Location, userId: string) => {
    try {
        const locationId = database.one(
                `insert into public.location
                     (id, street, zipCode, city, state, nickname, "user")
                 VALUES ($1, $2, $3, $4, $5, $6, $7)
                 returning id;`,
            [location.id, location.street, location.zipCode, location.city, location.state, location.nickname, userId],
            data => {
                return data.id
            }
        );
        return (await locationId);
    } catch (e) {
        throw new Error(`Error creating location: ${e}`);
    }
};

export const updateLocation = async (location: Location) => {
    try {
        return database.none(
                `UPDATE public.location
                 SET street   = $1,
                     zipcode  = $2,
                     city     = $3,
                     state    = $4,
                     nickname = $5
                 WHERE id = $6`,
            [location.street, location.zipCode, location.city, location.state, location.nickname, location.id]
        );
    } catch (e) {
        throw new Error(`Error updating location ${location.id}: ${e}`)
    }
};

export const getLocationsForUser = async (userId: string): Promise<Location[]> => {
    try {
        const locationEntity = database.manyOrNone(
                `SELECT id, street, zipcode, city, state, nickname
                 FROM public.location
                 WHERE "user" = $1`,
            [userId]
        );

        return (await locationEntity).map(location => {
            return new Location(
                location.id,
                location.street,
                location.city,
                location.state,
                location.zipcode,
                location.nickname
            );
        })
    } catch (e) {
        throw new Error(`Error retrieving locations for user ${userId}: ${e}`);
    }
};

export const getLocationById = async (locationId: string): Promise<Location> => {
    return database.one(`SELECT id, street, zipcode, city, state, nickname
                         FROM public.location
                         WHERE id = $1`, [locationId],
        data => {
            return new Location(data.id, data.street, data.city, data.state, data.zipcode, data.nickname)
        })
}
