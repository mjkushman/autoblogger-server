// "use strict";

/** Express app for AUTOBLOGGER. */
import express, { Express, Request, Response, NextFunction, ErrorRequestHandler } from "express";
import cors from "cors";
import morgan from "morgan";

import { NotFoundError } from "./utilities/expressError";
import { verifyJWT } from "./middleware/authorizations";
import errorHandler from "./middleware/errorHandler";

import swaggerUI from "swagger-ui-express";
import swaggerSpec from "./utilities/api_docs/swagger";
import formatResponse from "./middleware/responseHandler";
import { Config } from "./types/Config.type";
import routes from "./routes";


const createApp = (config: Config): Express => {
  const app: Express = express();
  
  
  // Set up swagger documentation
  app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(morgan("tiny"));
  app.use(verifyJWT); // stores decoded token on res.locals.user, if one is provided

  app.use("/", formatResponse, routes(config)); // All the routes

  // New error handler
  app.use(errorHandler);
  /** Handle 404 errors -- this matches everything */
  app.use(function (req: Request, res: Response, next: NextFunction) {
    return next(new NotFoundError());
  });
  return app;
};

export default createApp