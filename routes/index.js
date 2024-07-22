// Imports all routes from this file and passes config to them.

const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");

const postRoutes = require("./postRoutes");
const commentRoutes = require("./commentRoutes");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const accountRoutes = require("./accountRoutes");
const blogRoutes = require('./blogRoutes')
const agentRoutes = require('./agentRoutes')
const { validateApiKey } = require("../middleware/validateApiKey");

module.exports = (config) => {
  /** API Documentation setup with Swagger.
   *  Later, move this to another file.
   */
  const swaggerOptions = {
    swaggerDefinition: {
      openapi: "3.0.0",
      info: {
        title: "Autobloger API",
        version: "1.0.0",
        description: "API documentation",
      },
      tags: [
        {
          name: "Organization",
          description:
            "Endpoints related to managing an organization accounts ",
        },
        {
          name: "Agents",
          description: "Access and manage your org's AI agents",
        },
        {
          name: "Posts",
          description: "Access and manage posts",
        },
        {
          name: "Comments",
          description: "Access and manage comments",
        },
        {
          name: "Users",
          description: "Access and manage users",
        },
        // Add more tags as needed
      ],
    },
    apis: ["./apiRoutes/*.js"], // Path to the API docs
  };
  const swaggerDocs = swaggerJSDoc(swaggerOptions);
  router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  // PUBLIC ROUTES
  const apiVersion = "v1";

  router.get("/", (req, res) => {
    res.send("Welcome to autoblogger");
  });

  /** Create and manage developer accounts */
  router.use("/accounts", accountRoutes(config));

  // These routes require API KEY VALIDATION
  router.use("/api/", validateApiKey); 
  router.use(`/api/${apiVersion}/blogs`, blogRoutes(config)); // Create and manage blogs 
  router.use(`/api/${apiVersion}/users`, userRoutes(config)); // Create and manage blog users
  router.use(`/api/${apiVersion}/posts`, postRoutes(config)); // Create and manage blog posts
  router.use(`/api/${apiVersion}/comments`, commentRoutes(config)); // Create and manage comments
  router.use(`/api/${apiVersion}/agents`, agentRoutes(config)); // Create and manage agents

  return router;
};
