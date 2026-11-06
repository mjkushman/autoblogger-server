// "use strict";

/** Express app for AUTOBLOGGER. */
import express, { Express, Request, Response, NextFunction } from "express";
import cors from "cors";
import morgan from "morgan";

import { NotFoundError } from "./utilities/expressError";
import { verifyJWT } from "./middleware/authorizations";
import errorHandler from "./middleware/errorHandler";

import formatResponse from "./middleware/responseHandler";
import { Config } from "./types/Config.type";
import routes from "./routes";
const createApp = (config): Express => {
  const app: Express = express();

  app.set("trust proxy", 1); // behind one proxy (Render), so rate limits use the visitor's IP
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(morgan("tiny"));
  app.use(verifyJWT); // stores decoded token on res.user, if one is provided

  app.use("/", formatResponse, routes(config)); // All the routes

  /** Handle 404 errors -- this matches everything */
  app.use(function (_req: Request, _res: Response, next: NextFunction) {
    return next(new NotFoundError());
  });

  // Must come last so it also catches the 404 above
  app.use(errorHandler);
  return app;
};

export default createApp;
