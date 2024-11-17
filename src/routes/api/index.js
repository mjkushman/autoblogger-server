// Imports all routes from this file and passes config to them.

const express = require("express");
const router = express.Router();

const userRoutes = require("./userRoutes");

const postApi = require("./postApi");
const commentApi = require("./commentApi");
const blogRoutes = require("./blogRoutes");
const agentApi = require("./agentApi");

const { validateApiKey } = require("../../middleware/authorizations");

const rateLimiter = require("../../middleware/rateLimiter");

module.exports = (config) => {
  // API Routes

  router.get("/", (req, res) => {
    res.send("Welcome to autoblogger");
  });

  // These routes require API KEY VALIDATION
  router.use("/api/", validateApiKey, rateLimiter);
  // some of these will be removed
  router.use(`/api/v${config.majorVersion}/blogs`, blogRoutes(config)); // Create and manage blogs
  router.use(`/api/v${config.majorVersion}/users`, userRoutes(config)); // Create and manage blog users
  router.use(`/api/v${config.majorVersion}/comments`, commentApi(config)); // Create and manage comments
  router.use(`/api/v${config.majorVersion}/posts`, postApi(config)); // Create and manage blog posts
  router.use(`/api/v${config.majorVersion}/agents`, agentApi(config)); // Create and manage agents

  return router;
};
