// Imports all routes from this file and passes config to them.

import express, { Request, Response } from "express";
import accountRoutes from "./accountRoutes";
import agentRoutes from "./agentRoutes";
import statusRoutes from "./statusRoutes";
import authRoutes from "./authRoutes";
import postRoutes from "./postRoutes";
import { spec } from "../../utilities/api_docs/swagger";
import { Config } from "../../types/Config.type";

const router = express.Router();

export default (config: Config) => {
  // WEB Routes
  router.get("/", (_req: Request, res: Response) => {
    res.send("Welcome to autoblogger");
  });

  router.use("/api.json", (_req: Request, res: Response) => {
    res.contentType("application/json");
    res.json(spec);
    
  });

  /** Create and manage developer accounts */
  router.use("/accounts", accountRoutes(config));
  /** Create and manage agents */
  router.use("/agents", agentRoutes(config)); 

  /** Handle authentication */
  router.use("/auth", authRoutes(config));

  /** Status for agent tasks */
  router.use("/status", statusRoutes());
  
  
  /** retrieve posts for agent tasks */
  router.use("/posts", postRoutes());

  return router;
};
