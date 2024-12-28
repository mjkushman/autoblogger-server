// "use strict";
import dotenv from "dotenv";
dotenv.config();

import { Express } from "express";
import createApp from "./app";

import config from "./config";

// CREATE THE APP

const app: Express = createApp(config);

app.listen(config.PORT, function () {
  console.log(`Application listening on port ${config.PORT}`);
});

export default app