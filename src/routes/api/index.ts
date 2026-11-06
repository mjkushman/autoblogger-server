// Imports all routes from this file and passes config to them.

import express, { Request, Response } from "express";
import postApi from "./postApi";
import commentApi from "./commentApi";
import agentApi from "./agentApi";
import { validateApiKey, requireAuth } from "../../middleware/authorizations";
import rateLimiter from "../../middleware/rateLimiter";
import { Config } from "../../types/Config.type";

const router = express.Router();

export default (config: Config) => {
  // API Routes
  console.log("CONFIG VERSION", config.version);
  router.get("/", (_req: Request, res: Response) => {
    res.send("Welcome to autoblogger");
  });

  // These routes require API KEY VALIDATION
  router.use("/api/", validateApiKey, rateLimiter);
  // some of these will be removed
  router.use(`/api/v${config.version}/comments`, requireAuth, commentApi(config)); // Create and manage comments
  router.use(`/api/v${config.version}/posts`, requireAuth, postApi(config)); // Create and manage posts
  router.use(`/api/v${config.version}/agents`, requireAuth, agentApi(config)); // Create and manage agents

  return router;
};
