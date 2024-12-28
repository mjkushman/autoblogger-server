"use strict";

// Routes to set up a new org and user

const express = require("express");
const router = express.Router({ mergeParams: true });
const AccountService = require("../../services/AccountService"); 
import AuthService from "../../services/AuthService";


const { BadRequestError, UnauthorizedError } = require("../../utilities/expressError");
const { validateApiKey } = require("../../middleware/authorizations");

module.exports = (config) => {


  /** Gets one account specified in request.user
   *
   */
  router.get("/", async function (req, res, next) {
    try {
      let { accountId } = res.locals;
      let result = await AccountService.findOne(accountId);
      return res.sendResponse({ data: result, status: 200 });
    } catch (error) {
      return next(error);
    }
  });

  // Handle post request to create a developer account. Sends back a token
  router.post("/", async function (req, res, next) {
    try {
      const account = await AccountService.create(req);
      const token = await AuthService.generateToken(account.accountId);

      return res.sendResponse({ data: token, status: 201 });
    } catch (error) {
      return next(error);
    }
  });

  // Update an account
  router.patch("/", async function (req, res, next) {
    const { body } = req;
    const { accountId } = res.locals;
    // make sure the account being updated is also the one sending the request
    if(!body) throw BadRequestError(`Must provide body in request.`)
    try {
      const account = await AccountService.update({ accountId, body });

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
      const { body } = req;
      const { accountId } = res.locals;
      const { agentId } = body;
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
      const result = await AccountService.destroy(res.locals.accountId);

      return res.sendResponse({
        data: result,
        status: 200,
        message: "Delete successful.",
      });
    } catch (error) {
      return next(error);
    }
  });

  return router;
};
