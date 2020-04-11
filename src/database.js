import dotenv from 'dotenv';
import pgp from 'pg-promise';
import monitor from 'pg-monitor';

dotenv.config();

const dbConnectionString = process.env.DATABASE_URL;
const initOptions = {};
monitor.attach(initOptions);

const db = pgp(initOptions)(dbConnectionString);

export default db;
