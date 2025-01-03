// Imports all routes from this file and passes config to them.

const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");

const postApi = require("./postApi");
const commentApi = require("./commentApi");
const agentApi = require("./agentApi");

const { validateApiKey, requireAuth } = require("../../middleware/authorizations");

const rateLimiter = require("../../middleware/rateLimiter");

module.exports = (config) => {
  // API Routes
  console.log("CONFIG VERSION", config.version);
  router.get("/", (req, res) => {
    res.send("Welcome to autoblogger");
  });

  // These routes require API KEY VALIDATION
  router.use("/api/", validateApiKey, rateLimiter);
  // some of these will be removed
  router.use(`/api/v${config.version}/users`, requireAuth, userRoutes(config)); // Create and manage users
  router.use(`/api/v${config.version}/comments`, commentApi(config)); // Create and manage comments
  router.use(`/api/v${config.version}/posts`, requireAuth, postApi(config)); // Create and manage posts
  router.use(`/api/v${config.version}/agents`, requireAuth, agentApi(config)); // Create and manage agents

  return router;
};
