"use strict";

// Routes to set up a new org and user

const express = require("express");
const router = express.Router({ mergeParams: true });
const developerService = require("../services/AccountService");

const { BadRequestError } = require("../utilities/expressError");
const { validateApiKey } = require("../middleware/validateApiKey");

module.exports = (config) => {
  // Hello world
  router.get("/", async function (req, res, next) {
    return res.json({ msg: "Accounts home. This page will be replaced by a docs page or just redirect to /" });
  });

  
  // Handle post request to create a developer account
  router.post("/", async function (req, res, next) {
    // console.log("developerRoute: BODY (req.body)", req.body, req);
    
    let result = await developerService.create(req);
    return res.status(result.status).json(result);
  });
  
  router.get("/protected", validateApiKey, async function (req, res, next) {
    console.log('Developer gained access. Dev:', res.user)
    return res.json({ msg: "This is a protected route",
      user: req.user
     });
  });

  return router;
};
