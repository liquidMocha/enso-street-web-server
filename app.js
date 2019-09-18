import express from "express";

import dotenv from 'dotenv';
import usersRouter from "./routes/UsersController";
import logger from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import bodyParser from "body-parser";
import helmet from "helmet";
import cors from "cors";
import https from "https";
import fs from "fs";

dotenv.config();
let uiDomain = process.env.uiBaseUrl;
console.log("ui base url is: ", uiDomain);

const app = express();
app.use(cors({
    origin: uiDomain
}));

app.use(helmet());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const port = 8080;
if(process.env.isLocal) {
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


app.use('/users', usersRouter);

export default app;