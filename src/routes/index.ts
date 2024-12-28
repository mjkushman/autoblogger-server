// Imports all routes from this file and passes config to them.

import express, { Router } from "express";

import webRoutes from "./web";
import apiRoutes from "./api";
import { Config } from "../types/Config.type";

export default (config: Config) => {
  // console.log('ROUTES INDEX', config)
  const router: Router = express.Router();
  router.use(webRoutes(config));
  router.use(apiRoutes(config));
  return router;
};

