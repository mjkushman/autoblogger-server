"use strict";

/** Express app for AUTOBLOGGER. */

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const swaggerJsdoc = require('swagger-jsdoc')
const swaggerUi = require('swagger-ui-express')

const { NotFoundError } = require("./expressError");
const postRoutes = require("./routes/postRoutes");
const { verifyJWT } = require("./middleware/authorizations");
const authRoutes = require("./routes/authRoutes");
// const usersRoutes = require("./routes/userRoutes");
const agentRoutes = require("./agents/agentRoutes");
// const orgRoutes = require("./orgs/orgRoutes");
const orgUserRoutes = require("./orgUser/orgUserRoutes");


const app = express();

const routes = require('./routes')

// refactor starts
module.exports = (config) => {
  
  app.use(cors());
  app.use(express.urlencoded({extended:true}));
  app.use(express.json());
  app.use(morgan("tiny"));
  app.use(verifyJWT); // stores decoded token on res.locals.user, if one is provided
  
  app.use('/', routes(config))
  // app.use("/auth", authRoutes);
  // app.use("/agents", agentRoutes);
  // app.use("/orgs", orgRoutes);
  // app.use("/orgusers",orgUserRoutes);
  
  
  // app.use("/users", usersRoutes);
  // app.use("/posts", postRoutes);
  
  // const swaggerOptions = {
  //   swaggerDefinition: {
  //     openapi: '3.0.0',
  //     info: {
  //       title: 'Autobloger API',
  //       version: '1.0.0',
  //       description: 'API documentation',
  //     },
  //   },
  //   apis: ['./routes/*.js'], // Path to the API docs
  // };
  
  // const swaggerDocs = swaggerJsdoc(swaggerOptions)
  // app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs))
  
  
  /** Handle 404 errors -- this matches everything */
  app.use(function (req, res, next) {
    return next(new NotFoundError());
  });
  
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
}




