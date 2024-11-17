// Imports all routes from this file and passes config to them.

const express = require("express");
const router = express.Router();

const accountRoutes = require("./accountRoutes");

const agentRoutes = require("./agentRoutes");
const statusRoutes = require("./statusRoutes");
const authRoutes = require("./authRoutes");

module.exports = (config) => {
  // WEB Routes
  router.get("/", (req, res) => {
    res.send("Welcome to autoblogger");
  });

  /** Create and manage developer accounts */
  router.use("/accounts", accountRoutes(config));
  /** Create and manage agents */
  router.use(`/agents`, agentRoutes(config)); 

  /** Handle authentication */
  router.use("/auth", authRoutes(config));

  /** Status for agent tasks */
  router.use("/status", statusRoutes(config));

  return router;
};
