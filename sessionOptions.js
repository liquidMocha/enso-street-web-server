// import session from "express-session";
// import redis from "redis";
//
// const redisHost = process.env.redisHost;
// const redisPassword = process.env.redisPassword;
// const redisPort = process.env.redisPort;
//
// const redisStore = require('connect-redis')(session);
// const redisClient = redis.createClient({
//         port: redisPort,
//         host: redisHost,
//         password: redisPassword
//     }
// );
//
// let cookieExpirationInMils = 1000 * 60 * 30;
//
// const sessionOptions = {
//     cookie: {
//         secure: true,
//             httpOnly: true,
//             maxAge: cookieExpirationInMils
//     },
//     secret: process.env.sessionSecret,
//         store: new redisStore({host: redisHost, password: redisPassword, port: redisPort, client: redisClient, ttl: 260}),
//     saveUninitialized: false,
//     resave: false
// };
//
// export default sessionOptions;