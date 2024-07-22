"use strict";

// Routes to set up a new org and user

const express = require("express");
const router = express.Router({ mergeParams: true });
const accountService = require("../services/AccountService");
const IdGenerator = require("../utilities/IdGenerator");

const { BadRequestError } = require("../expressError");
const { validateApiKey } = require("../middleware/validateApiKey");

module.exports = (config) => {
  // Hello world
  router.get("/", async function (req, res, next) {
    return res.json({
      msg: "Accounts home. This page will be replaced by a docs page or just redirect to /",
    });
  });
  router.get("/idgen", async function (req, res, next) {
    let id = IdGenerator.agentId();
    return res.json({ msg: "Generated ID", id });
  });
  
  router.get("/all", async function (req, res, next) {
    let result = await accountService.findAll();
    return res.json(result)
  });

  // Handle post request to create a developer account
  router.post("/", async function (req, res, next) {
    let result = await accountService.create(req);
    return res.status(result.status).json(result);
  });

  router.get("/protected", validateApiKey, async function (req, res, next) {
    console.log("Developer gained access. Dev:", res.user);
    return res.json({ msg: "This is a protected route", user: req.user });
  });

  return router;
};
