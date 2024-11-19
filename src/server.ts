// "use strict";
import dotenv from "dotenv";
dotenv.config();

import { Express } from "express";
import createApp from "./app";

import config from "./config";


// CREATE THE APP
console.log('creating app with config: ',config )
const app: Express = createApp(config);

app.listen(config.PORT, function () {
  console.log(`Started on http://localhost:${config.PORT}`);
});
