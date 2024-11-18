const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const express = require("express");
const router = express.Router();
const path = require("path");

import config from "../../config";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Autoblogger API docs",
      version: config.version,
    },
    servers: [
      {
        url: `http://localhost:3001/api/v${config.majorVersion}`,
        description: "Development server",
      },
      {
        url: "https://app.com/api",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "X-API-KEY",
        },
      },
    },
    tags: [
      {
        name: "Posts",
        description: "Operations about posts",
      },
      {
        name: "Comments",
        description: "Operations about comments",
      },
      {
        name: "Users",
        description: "Operations about users",
      },
    ],
  },
  apis: [
    "routes/**/*Routes.js",
    "routes/**/*Api.js",
    "routes/**/*Api.yml",
    "schemas/**/*.yml",
  ],
};

const openapiSpecification = swaggerJsdoc(options);
console.log("OPTIONS");
console.dir(options);

function swaggerDocs(app) {
  router.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiSpecification));

  console.log(`Docs available at http://localhost:${config.PORT}`);
}

export default swaggerJsdoc(options);
