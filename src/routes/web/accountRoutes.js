"use strict";

// Routes to set up a new org and user

const express = require("express");
const router = express.Router({ mergeParams: true });
const accountService = require("../../services/AccountService");
const authService = require("../../services/AuthService");
const IdGenerator = require("../../utilities/IdGenerator");

const { BadRequestError, UnauthorizedError } = require("../../utilities/expressError");
const { validateApiKey } = require("../../middleware/authorizations");

module.exports = (config) => {
  // This is a temporary utility route
  router.get("/idgen", async function (req, res, next) {
    let id = IdGenerator.agentId();
    return res.sendResponse({ data: id, message: "Generated Id", status: 200 });
  });

  router.get("/all", async function (req, res, next) {
    let result = await accountService.findAll();
    return res.sendResponse({ data: result, status: 200 });
  });

  /** Gets one account specified in request.user
   *
   */
  router.get("/", async function (req, res, next) {
    let { accountId } = req.user;
    try {
      let result = await accountService.findOne(accountId);
      return res.sendResponse({ data: result, status: 200 });
    } catch (error) {
      return next(error);
    }
  });

  // Handle post request to create a developer account. Sends back a token
  router.post("/", async function (req, res, next) {
    try {
      const account = await accountService.create(req);
      const token = await authService.generateToken(account);

      return res.sendResponse({ data: token, status: 201 });
    } catch (error) {
      return next(error);
    }
  });

  // Update an account
  router.patch("/", async function (req, res, next) {
    const { body, user } = req;
    const { accountId } = user;
    // make sure the account being updated is also the one sending the request
    if(user.accountId != body.accountId) throw UnauthorizedError(`You can't do that.`)
    try {
      const account = await accountService.update({ accountId, body });

      return res.sendResponse({ data: account, status: 200 });
    } catch (error) {
      return next(error);
    }
  });

  //
  router.patch("/", async function (req, res, next) {
    console.log("HIT AGENT PATCH '/'");
    try {
      // Verify that the agent being updated belongs to the same org as the user making the update
      const { body, user } = req;
      const { accountId } = user;
      const { agentId } = req.body;
      console.log("agentId", agentId);
      // const ownedAgents = account.Agents.map((a) => a.agentId)

      // if(!ownedAgents.includes(agentId)) throw new UnauthorizedError("You may only modify agents that belong to your account.")
      const result = await AgentService.update({ accountId, agentId, body });
      return res.sendResponse({ data: result, status: 200 });
    } catch (error) {
      next(error);
    }
  });

  //

  // Handle delete account
  router.delete("/", async function (req, res, next) {
    try {
      const result = await accountService.destroy(req.user.accountId);

      return res.sendResponse({
        data: result,
        status: 200,
        message: "Delete successful.",
      });
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
