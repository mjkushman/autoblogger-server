// "use strict";
import dotenv from "dotenv";
dotenv.config();

import { Express } from "express";
import createApp from "./app";

const { PORT, NODE_ENV } = require("./config");
const config = require("./config")[NODE_ENV];

// CREATE THE APP
const app: Express = createApp(config);

app.listen(PORT, function () {
  console.log(`Started on http://localhost:${PORT}`);
});
