import dotenv from "dotenv";
dotenv.config();

import { Express } from "express";
import createApp from "./app";
import config from "./config";
import { ready } from "./models";
import AgentService from "./services/AgentService";

// CREATE THE APP

const app: Express = createApp(config);

app.listen(config.PORT, function () {
  console.log(`Application listening on port ${config.PORT}`);
});

// Once the database is ready, schedule all active agent tasks
ready
  .then(() => AgentService.loadActive())
  .catch((e) => console.log("Error loading active agents:", e));

export default app;
