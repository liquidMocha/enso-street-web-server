import express from "express";

import usersRouter from "./routes/UsersController";
import logger from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import bodyParser from "body-parser";
import helmet from "helmet";

const app = express();

app.use(helmet());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const port = 8080;
app.listen(port, () => console.log(`Enso street web server is listening on port ${port}!`));

app.use('/users', usersRouter);

export default app;