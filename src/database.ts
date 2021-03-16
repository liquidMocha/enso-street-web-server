import pgPromise from 'pg-promise';

const dbConnectionString: string = process.env.DATABASE_URL!;
const initOptions = {};

const pgp = pgPromise(initOptions);
pgp.pg.defaults.ssl = true;

const db = pgp(dbConnectionString);

export default db;
