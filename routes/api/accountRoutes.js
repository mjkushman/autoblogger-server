"use strict";

// Routes to set up a new org and user

const express = require("express");
const router = express.Router({ mergeParams: true });
const accountService = require("../../services/AccountService");
const authService = require("../../services/AuthService");
const IdGenerator = require("../../utilities/IdGenerator");

const { BadRequestError } = require("../../utilities/expressError");
const { validateApiKey } = require("../../middleware/validateApiKey");

module.exports = (config) => {
  // Hello world


  router.get("/idgen", async function (req, res, next) {
    let id = IdGenerator.agentId();
    return res.json({ msg: "Generated ID", id });
  });

  router.get("/all", async function (req, res, next) {
    let result = await accountService.findAll();
    return res.json(result);
  });
  
  /** Gets one account specified in request.user
   * 
   */
  router.get("/", async function (req, res, next) {
    let { accountId } = req.user;
    try {
      let result = await accountService.findOne(accountId);
      return res.json(result);
      
    } catch (error) {
      return next (error)
    }
  });

  // Handle post request to create a developer account. Sends back a token
  router.post("/", async function (req, res, next) {
    try {
      const account = await accountService.create(req);

      const token = await authService.generateToken(account);
      return res.status(201).json({ token });
    } catch (error) {
      return next(error);
    }
  });

  router.get("/protected", validateApiKey, async function (req, res, next) {
    console.log("Developer gained access. Dev:", req.account);
    return res.json({ msg: "This is a protected route", account: req.account });
  });

  return router;
};
