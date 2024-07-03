// Imports all routes from this file and passes config to them.

const express = require("express");
const router = express.Router();

const orgRoutes = require("./orgRoutes");
const userRoutes = require("./userRoutes");

const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const blogRoutes = require("./blogRoutes");

module.exports = (config) => {
  /** API Documentation setup with Swagger.
   *  Later, move this to another file.
   */
  const swaggerOptions = {
    swaggerDefinition: {
      openapi: "3.0.0",
      info: {
        title: "Autobloger Admin API",
        version: "1.0.0",
        description: "API documentation",
      },
      tags: [
        {
          name: "Orgs",
          description: "Endpoints related to managing an organization "
        },
        {
          name: "Auth",
          description: "Endpoints for managing organization user authentication"
        },
        {
          name: "Users",
          description: "Access and manage organization users"
        },
        {
          name: "Blogs",
          description: "Access and manage blogs"
        },
        // Add more tags as needed
      ]
    },
    apis: ["./adminRoutes/*.js"], // Path to the API docs
  };
  const swaggerDocs = swaggerJSDoc(swaggerOptions);
  router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

  // PUBLIC ROUTES
  router.get("/", (req, res) => {
    res.send("Welcome to autoblogger");
  });

  // ROUTES FOR AUTOBLOGGER BUSINESS
  /** Create and manage organizations */
  router.use("/orgs", orgRoutes(config));
  
  /** Create and manage organizations */
  router.use("/blogs", blogRoutes(config));
  
  /** Create and manage users */
  router.use("/users", userRoutes(config));


  // ROUTES FOR ORGS TO USE
  /** Home route for the organization.
   *  Do I even need this route? Not sure I do.
   */
  router.get("/:orgId", (req, res) => {
    const { orgId } = req.params;
    res.send(`Welcome to org ID: ${orgId}`);
  });
  

  return router;
};
