
const express = require('express');
const router = express.Router();

const orgRoutes = require('./orgRoutes');


module.exports = (config) => {

  router.get('/', (req, res) => {
    res.send('Welcome to autoblogger');
  });

  router.use('/orgs', orgRoutes(config));
  

  return router;
};
