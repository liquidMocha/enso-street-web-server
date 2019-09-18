import dotenv from 'dotenv';
import pgp from 'pg-promise';
dotenv.config();

const dbConnectionString = process.env.databaseUri;
const initOptions = {};

const db = pgp(initOptions)(dbConnectionString);

export default db;