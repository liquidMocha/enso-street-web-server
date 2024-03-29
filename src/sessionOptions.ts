import session, {SessionOptions} from "express-session";
import redis from "redis";

const redisHost = process.env.redisHost;
const redisPassword = process.env.redisPassword;
const redisPort = process.env.redisPort;

const redisStore = require('connect-redis')(session);
const redisClient = redis.createClient(process.env.REDIS_URL!);

const THIRTY_DAYS = 1000 * 60 * 60 * 24 * 30;

const sessionOptions = {
    cookie: {
        secure: true,
        httpOnly: true,
        maxAge: THIRTY_DAYS,
        sameSite: 'strict'
    },
    secret: process.env.sessionSecret!!,
    store: new redisStore({host: redisHost, password: redisPassword, port: redisPort, client: redisClient, ttl: 260}),
    saveUninitialized: false,
    resave: false
} as SessionOptions;

export default sessionOptions;
