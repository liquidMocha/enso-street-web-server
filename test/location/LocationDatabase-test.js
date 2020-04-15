import database from '../../src/database.js';
import {assert} from "chai";
import {
    createLocation,
    getLocationById,
    getLocationsForUser,
    updateLocation
} from "../../src/location/LocationRepository";
import {setupUser} from "../TestHelper";
import Location from '../../src/location/Location'
import {uuid} from "uuidv4";

function assertSameLocation(actualLocation, location) {
    assert.equal(actualLocation.street, location.street);
    assert.equal(actualLocation.zipCode, location.zipCode);
    assert.equal(actualLocation.city, location.city);
    assert.equal(actualLocation.state, location.state);
    assert.equal(actualLocation.nickname, location.nickname);
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
        const location = new Location(
            uuid(),
            "astor",
            "Chicago",
            "IL",
            "123456",
            "home"
        );
        const locationId = await createLocation(location, userId);

        const actualLocation = await getLocationById(locationId);

        assertSameLocation(actualLocation, location);
    });

    it('should get all locations for user', async () => {
        const location1 = new Location(
            uuid(),
            "dunder",
            "Chicago",
            "IL",
            "123456",
            "home"
        );

        const location2 = new Location(
            uuid(),
            "mifflin",
            "65897",
            "Scranton",
            "PA",
            "office"
        );
        await createLocation(location1, userId);
        await createLocation(location2, userId);

        const locations = await getLocationsForUser(userId);

        assert.equal(locations.length, 2);
        assertSameLocation(locations[0], location1);
        assertSameLocation(locations[1], location2);
    });

    it('should update location', async () => {
        const locationId = uuid();
        const location = new Location(
            locationId,
            "astor",
            "Chicago",
            "IL",
            "123456",
            "home"
        );

        await createLocation(location, userId);

        const updatedLocation = new Location(
            locationId,
            "mifflin",
            "Scranton",
            "PA",
            "65897",
            "office"
        );
        await updateLocation(updatedLocation);

        const actualLocation = await getLocationById(locationId);

        assert.deepEqual(actualLocation, updatedLocation);
    });
});
