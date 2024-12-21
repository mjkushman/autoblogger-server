// Imports all routes from this file and passes config to them.

const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");

const postApi = require("./postApi");
const commentApi = require("./commentApi");
const agentApi = require("./agentApi");

const { validateApiKey } = require("../../middleware/authorizations");

const rateLimiter = require("../../middleware/rateLimiter");

module.exports = (config) => {
  // API Routes
console.log("CONFIG VERSION", config.version)
  router.get("/", (req, res) => {
    res.send("Welcome to autoblogger");
  });

  // These routes require API KEY VALIDATION
  router.use("/api/", validateApiKey, rateLimiter);
  // some of these will be removed
  router.use(`/api/v${config.version}/users`, userRoutes(config)); // Create and manage users
  router.use(`/api/v${config.version}/comments`, commentApi(config)); // Create and manage comments
  router.use(`/api/v${config.version}/posts`, postApi(config)); // Create and manage posts
  router.use(`/api/v${config.version}/agents`, agentApi(config)); // Create and manage agents

  return router;
};
