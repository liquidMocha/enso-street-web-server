import database from '../../database';
import {assert} from "chai";
import {createLocation, getLocationsForUser, updateLocation} from "../../location/LocationRepository";
import {setupUser} from "../TestHelper";

function assertSameLocationWithUserId(actualLocation, location, userId) {
    assert.equal(actualLocation.street, location.street);
    assert.equal(actualLocation.zipcode, location.zipCode);
    assert.equal(actualLocation.city, location.city);
    assert.equal(actualLocation.state, location.state);
    assert.equal(actualLocation.nickname, location.nickname);
    assert.equal(actualLocation.user, userId);
}

function assertSameLocationObjectWithUserId(actualLocation, location, userId) {
    assert.equal(actualLocation.street, location.street);
    assert.equal(actualLocation.zipCode, location.zipCode);
    assert.equal(actualLocation.city, location.city);
    assert.equal(actualLocation.state, location.state);
    assert.equal(actualLocation.nickname, location.nickname);
}

async function getLocationBy(locationId) {
    return await database.one(
            `SELECT city, nickname, state, street, "user", zipcode as zipCode
             FROM location
             WHERE id = $1`,
        [locationId]
    );
}

describe('location data', () => {
    let userId;
    before(async () => {
        userId = await setupUser({email: "user@email.com"});
    });

    afterEach(() => {
        database.none('truncate public.location cascade;');
    });

    it('should create location', async () => {
        const location = {
            street: "astor",
            zipCode: "123456",
            city: "Chicago",
            state: "IL",
            nickname: "home"
        };
        const locationId = await createLocation(location, userId);

        const actualLocation = await getLocationBy(locationId);

        assertSameLocationWithUserId(actualLocation, location, userId);
    });

    it('should get all locations for user', async () => {
        const location1 = {
            street: "dunder",
            zipCode: "123456",
            city: "Chicago",
            state: "IL",
            nickname: "home"
        };

        const location2 = {
            street: "mifflin",
            zipCode: "65897",
            city: "Scranton",
            state: "PA",
            nickname: "office"
        };
        await createLocation(location1, userId);
        await createLocation(location2, userId);

        const locations = await getLocationsForUser(userId);

        assert.equal(locations.length, 2);
        assertSameLocationObjectWithUserId(locations[0], location1, userId);
        assertSameLocationObjectWithUserId(locations[1], location2, userId);
    });

    it('should update location', async () => {
        const location = {
            street: "astor",
            zipCode: "123456",
            city: "Chicago",
            state: "IL",
            nickname: "home"
        };
        const locationId = await createLocation(location, userId);

        const updatedLocation = {
            id: locationId,
            street: "mifflin",
            zipCode: "65897",
            city: "Scranton",
            state: "PA",
            nickname: "office"
        };
        await updateLocation(updatedLocation, userId);

        const actualLocation = await getLocationBy(locationId);

        assertSameLocationWithUserId(actualLocation, updatedLocation, userId)
    });
});
