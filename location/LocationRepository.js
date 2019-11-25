import database from '../database';

export const createLocation = (location, userId) => {
    return database.one(
            `insert into public.location
                 (street, zipCode, city, state, "user")
             VALUES ($1, $2, $3, $4, $5)
             returning id;`,
        [location.street, location.zipCode, location.city, location.state, userId]
    ).then(data => {
        return data.id;
    }).catch(error => {
        console.log("Error creating location: ", error);
    })
};