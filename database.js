const cfenv = require('cfenv');

const appEnv = cfenv.getAppEnv();
const dbConnectionString = appEnv.services.elephantsql ? appEnv.services.elephantsql[0].credentials.uri : 'postgres://enso-street:password@localhost:5432/enso-street';
const initOptions = {
    // initialization options;
};

const pgp = require('pg-promise')(initOptions);

const db = pgp(dbConnectionString);

module.exports = {
    pgp, db
};