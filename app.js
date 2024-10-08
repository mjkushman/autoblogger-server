"use strict";

/** Express app for AUTOBLOGGER. */

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const { NotFoundError } = require("./utilities/expressError");
const { verifyJWT } = require("./middleware/authorizations");
const errorHandler = require("./middleware/errorHandler");


const app = express();

const routes = require("./routes");



module.exports = (config) => {
  app.use(cors());
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());
  app.use(morgan("tiny"));
  app.use(verifyJWT); // stores decoded token on res.locals.user, if one is provided


  app.use("/", routes(config)); // All the routes

  /** Handle 404 errors -- this matches everything */
  app.use(function (req, res, next) {
    return next(new NotFoundError());
  });

  // New error handler
  app.use(errorHandler)

  /** Generic error handler; anything unhandled goes here. */
  app.use(function (err, req, res, next) {
    if (process.env.NODE_ENV !== "test") console.error(err.stack);
    const status = err.status || 500;
    const message = err.message;

    return res.status(status).json({
      error: { message, status },
    });
  });

  return app;
};
