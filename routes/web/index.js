// Imports all routes from this file and passes config to them.

const express = require("express");
const router = express.Router();

const userRoutes = require("../api/userRoutes");

const commentRoutes = require("../api/commentRoutes");

const accountRoutes = require("../api/accountRoutes");

const agentRoutes = require("./agentRoutes");
const statusRoutes = require("./statusRoutes");
const authRoutes = require("./authRoutes");

const { validateApiKey } = require("../../middleware/validateApiKey");
const { verifyJWT } = require("../../middleware/authorizations");

module.exports = (config) => {
  // WEB Routes
  router.get("/", (req, res) => {
    res.send("Welcome to autoblogger");
  });

  /** Create and manage developer accounts */
  router.use("/accounts", accountRoutes(config));
  router.use(`/agents`, agentRoutes(config)); // Create and manage agents

  /** Handle authentication */
  router.use("/auth", authRoutes(config));

  /** Create and manage developer accounts */
  router.use("/status", statusRoutes(config));

  return router;
};
