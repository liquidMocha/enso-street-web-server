const initOptions = {
    // initialization options;
};

const pgp = require('pg-promise')(initOptions);

const cn = 'postgres://enso-street:password@localhost:5432/enso-street';
const db = pgp(cn);

module.exports = {
    pgp, db
};