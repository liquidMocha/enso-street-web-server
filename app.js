import express from "express";

import dotenv from 'dotenv';
import locationRouter from "./routes/LocationController";
import usersRouter from "./routes/UsersController";
import itemRouter from "./routes/ItemController";
import logger from "morgan";
import path from "path";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import https from "https";
import fs from "fs";
import session from "express-session";
import sessionOptions from "./sessionOptions";

dotenv.config();
const uiDomain = process.env.uiBaseUrl;

const app = express();
app.set('trust proxy', 1);
app.use(session(sessionOptions));
app.use(cors({origin: uiDomain, optionsSuccessStatus: 200, credentials: true}));

app.use(helmet());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(express.static(path.join(__dirname, 'public')));
const port = process.env.PORT || 8080;
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

app.use(function (req, res, next) {
    req.headers['if-none-match'] = 'no-match-for-this';
    next();
});

app.use('/items', itemRouter);
app.use('/users', usersRouter);
app.use('/users/locations', locationRouter);

export default app;