import swaggerJsdoc, { OAS3Options } from "swagger-jsdoc";
import swaggerUi, {
  SwaggerOptions,
  SwaggerUiOptions,
} from "swagger-ui-express";

import config from "../../config";
import express from "express";
const router = express.Router();


const options: OAS3Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Autoblogger API docs",
      version: config.version,
    },
    servers: [
      {
        url: `http://localhost:3001/api/v${config.version}`,
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
    "src/routes/**/*Routes.js",
    "src/routes/**/*Routes.ts",
    "src/routes/**/*Api.js",
    "src/routes/**/*Api.ts",
    "src/routes/**/*Api.yml",
    "src/schemas/**/*.yml",
  ],
};


export const spec = swaggerJsdoc(options);
// console.log("SWAGGER OPTIONS");
// console.dir(options);
// console.log("SWAGGER SPEC");
// console.dir(spec);

export const swaggerUiOptions: SwaggerUiOptions = {
  customCss: ".swagger-ui .topbar { display: none }",

};

export function makeSwaggerDocs(config) {
  router.use(
    "/docs",
    swaggerUi.serve,
    swaggerUi.setup(spec, swaggerUiOptions)
  );

  console.log(`Docs available at http://localhost:${config.PORT}`);
}

// export default swaggerJsdoc(options);
