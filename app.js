import express from "express";

import dotenv from 'dotenv';
import usersRouter from "./routes/UsersController";
import itemRouter from "./routes/ItemController";
import logger from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import https from "https";
import fs from "fs";
import session from "express-session";
import redis from "redis";
// import redisConnection from "connect-redis";

dotenv.config();
const uiDomain = process.env.uiBaseUrl;
const redisHost = process.env.redisHost;
const redisPassword = process.env.redisPassword;
const redisPort = process.env.redisPort;

const redisStore = require('connect-redis')(session);
const redisClient = redis.createClient({
        port: redisPort,
        host: redisHost,
        password: redisPassword
    }
);

const app = express();
let cookieExpirationInMils = 1000 * 60 * 30;
app.set('trust proxy', 1);
app.use(session({
    cookie: {
        secure: true,
        httpOnly: true,
        maxAge: cookieExpirationInMils
    },
    secret: process.env.sessionSecret,
    store: new redisStore({host: redisHost, password: redisPassword, port: redisPort, client: redisClient, ttl: 260}),
    saveUninitialized: false,
    resave: false
}));
app.use(cors({origin: uiDomain, optionsSuccessStatus: 200, credentials: true}));

app.use(helmet());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const port = 8080;
if (process.env.isLocal) {
    let cert = fs.readFileSync(__dirname + '/certs/certificate.pem');
    let key = fs.readFileSync(__dirname + '/certs/private.key');
    let options = {
        key: key,
        cert: cert
    };

    let server = https.createServer(options, app);
    server.listen(port, () => console.log(`Enso street web server is listening on port ${port}!`));
} else {
    app.listen(port, () => console.log(`Enso street web server is listening on port ${port}!`));
}

app.use('/items', itemRouter);
app.use('/users', usersRouter);

export default app;