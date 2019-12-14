import sinon from "sinon";

const LocationController = require('../routes/LocationController');

describe('location', () => {
    let location;
    let addLocationForUserStub;

    before(() => {
        // addLocationForUserStub = sinon.stub(LocationService, 'addLocationForUser');
    });

    beforeEach(() => {
        sinon.resetHistory();
    });

    after(() => {
        sinon.restore();
    });

    // it('should bounce the user if come in without a cookie', (done) => {
    //     request(app)
    //         .post('/api/users/locations/addLocation')
    //         .expect(401, (error) => {
    //             return done(error);
    //         })
    // });
    //
    // it('should create location for user', (done) => {
    //     location = new Location({
    //         address: "1725 Slough Avenue",
    //         city: "Scranton",
    //         state: "PA",
    //         zipCode: "18505-7427"
    //     });
    //
    //     let email = "someemail@enso.com";
    //
    //     const testApp = express();
    //     testApp.use((req, res, next) => {
    //         req.session = {email: email};
    //         next();
    //     });
    //
    //     testApp.use(app);
    //
    //     request(testApp)
    //         .post('/api/users/login');
    //     request(testApp)
    //         .post('/api/users/locations/addLocation')
    //         .send(location)
    //         .expect(201, (error, response) => {
    //             // sinon.assert.calledWithExactly(addLocationForUserStub, {location: location, email: email});
    //             return done(error);
    //         })
    // });
});