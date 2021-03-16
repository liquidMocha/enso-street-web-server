import pgPromise from 'pg-promise';

const dbConnectionString: string = process.env.DATABASE_URL!;
const initOptions = {};

const pgp = pgPromise(initOptions);
if (process.env.sslOn !== undefined) {
    pgp.pg.defaults.ssl = {
        rejectUnauthorized: false
    }
}

const db = pgp(dbConnectionString);

export default db;
