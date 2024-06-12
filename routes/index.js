// Imports all routes from this file and passes config to them.

const express = require('express');
const router = express.Router();

const orgRoutes = require('./orgRoutes');
const userRoutes = require('./userRoutes');
const endUserRoutes = require('./endUserRoutes');


module.exports = (config) => {

  router.get('/', (req, res) => {
    res.send('Welcome to autoblogger');
  });

  router.use('/orgs', orgRoutes(config));
  router.use('/:orgId/users', endUserRoutes(config));
  
  router.use("/users", userRoutes(config));

  return router;
};
