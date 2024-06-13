// Imports all routes from this file and passes config to them.

const express = require('express');
const router = express.Router();

const orgRoutes = require('./orgRoutes');
const userRoutes = require('./userRoutes');
const endUserRoutes = require('./endUserRoutes');
const postRoutes = require('./postRoutes');


module.exports = (config) => {

  router.get('/', (req, res) => {
    res.send('Welcome to autoblogger');
  });
  // Orgs
  router.use('/orgs', orgRoutes(config));
  
  // Users
  router.use("/users", userRoutes(config));
  
  // EndUsers
  router.use('/:orgId/users', endUserRoutes(config));
  
  // Posts
  router.use('/:orgId/posts', postRoutes(config));

  return router;
};
