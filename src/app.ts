require('newrelic');
import express from "express";

import locationRouter from "./location/LocationController";
import usersRouter from "./user/UsersController";
import itemRouter from "./item/ItemController";
import categoryRouter from "./category/CategoryController";
import searchRouter from "./search/SearchController";
import imageRouter from "./image/ImageController";
import cartRouter from "./cart/CartController";
import logger from "morgan";
import path from "path";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import https from "https";
import fs from "fs";
import axios from "axios";
import session from "express-session";
import sessionOptions from "./sessionOptions";

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

app.use(function (req, res, next) {
    req.headers['if-none-match'] = 'no-match-for-this';
    next();
});

app.disable('etag');

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

axios.interceptors.request.use(config => {
    console.info(`URL: ${config.url}; Method: ${config.method}`);
    return config;
}, error => {
    return Promise.reject(error);
});

app.use('/api/items', itemRouter);
app.use('/api/users', usersRouter);
app.use('/api/locations', locationRouter);
app.use('/api/category', categoryRouter);
app.use('/api/search', searchRouter);
app.use('/api/image', imageRouter);
app.use('/api/cart', cartRouter);

export default app;
