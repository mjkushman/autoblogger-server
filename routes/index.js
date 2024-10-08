// Imports all routes from this file and passes config to them.

const express = require("express");
const router = express.Router();

const webRoutes = require("./web");
const apiRoutes = require("./api");

module.exports = (config) => {
  // pipe the routes

  router.use(webRoutes(config))  
  router.use(apiRoutes(config))  


  return router;
};
