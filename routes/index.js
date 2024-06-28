// Imports all routes from this file and passes config to them.

const express = require("express");
const router = express.Router();

const orgRoutes = require("./orgRoutes");
const userRoutes = require("./userRoutes");
// const endUserRoutes = require("./endUserRoutes");
const postRoutes = require("./postRoutes");
const commentRoutes = require("./commentRoutes");
const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

module.exports = (config) => {
  /** API Documentation with Swagger */
  const swaggerOptions = {
    swaggerDefinition: {
      openapi: "3.0.0",
      info: {
        title: "Autobloger API",
        version: "1.0.0",
        description: "API documentation",
      },
    },
    apis: ["./routes/*.js"], // Path to the API docs
  };
  const swaggerDocs = swaggerJSDoc(swaggerOptions);
  router.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  // PUBLIC ROUTES
  router.get("/", (req, res) => {
    res.send("Welcome to autoblogger");
  });

  // ROUTES FOR AUTOBLOGGER BUSINESS
  /** Create and manage organizations */
  router.use("/orgs", orgRoutes(config));

  /** Create and manage business users of an organization */
  //   router.use("/users", userRoutes(config));

  // ROUTES FOR ORGS TO USE
  /** Home route for the organization */
  router.get("/:orgId", (req, res) => {
    const { orgId } = req.params;
    res.send(`Welcome to org ID: ${orgId}`);
  });

  /** Users of an org
   *  Create and manage users of their blog */
  router.use("/:orgId/users", userRoutes(config));

  /** Posts
   *  Create and manage blog posts */
  router.use("/:orgId/posts", postRoutes(config));

  /** Comments
   *  Lets blog users read/add comments to blog posts */
  router.use("/:orgId/comments", commentRoutes(config));

  return router;
};
