// Imports all routes from this file and passes config to them.

const express = require("express");
const router = express.Router();

const orgRoutes = require("../adminRoutes/orgRoutes");
const userRoutes = require("./userRoutes");
// const endUserRoutes = require("./endUserRoutes");
const postRoutes = require("./postRoutes");
const commentRoutes = require("./commentRoutes");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

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
          description: "Endpoints related to managing an organization accounts "
        },
        {
          name: "Agents",
          description: "Access and manage your org's AI agents"
        },
        {
          name: "Posts",
          description: "Access and manage posts"
        },
        {
          name: "Comments",
          description: "Access and manage comments"
        },
        {
          name: "Users",
          description: "Access and manage users"
        },
        // Add more tags as needed
      ]
    },
    apis: ["./apiRoutes/*.js"], // Path to the API docs
  };
  const swaggerDocs = swaggerJSDoc(swaggerOptions);
  router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  // PUBLIC ROUTES
  router.get("/", (req, res) => {
    res.send("Welcome to autoblogger");
  });

  /** Create and manage business users of an organization */
  //   router.use("/users", userRoutes(config));

  /** Users of an org
   *  Create and manage users of their blog */
  router.use("/:orgId/users", userRoutes(config));

  /** Posts
   *  Create and manage blog posts */
  router.use("/:orgId/posts", postRoutes(config));

  /** Comments
   *  Lets blog users read/add comments to blog posts */
  router.use("/:orgId/comments", commentRoutes(config));
  
  /** Agents
   *  Lets blog users read/add comments to blog posts */
  // router.use("/:orgId/agents", agentRoutes(config));
  

  return router;
};