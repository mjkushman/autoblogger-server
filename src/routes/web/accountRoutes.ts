"use strict";

// Routes to set up a new org and user

import express from "express";
import AccountService from "../../services/AccountService";
import AuthService from "../../services/AuthService";
import { requireAuth } from "../../middleware/authorizations";
import { BadRequestError } from "../../utilities/expressError";
import { Config } from "../../types/Config.type";

const router = express.Router({ mergeParams: true });

export default (config: Config) => {


  /** Gets one account specified in request.user
   *
   */
  router.get("/", requireAuth, async function (req, res, next) {
    try {
      const { accountId } = res.locals;
      const result = await AccountService.findOne(accountId);
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
  router.patch("/", requireAuth, async function (req, res, next) {
    const { body } = req;
    const { accountId } = res.locals;
    // make sure the account being updated is also the one sending the request
    try {
      if (!body) throw new BadRequestError("Must provide body in request.");
      const account = await AccountService.update({ accountId, body });

      return res.sendResponse({ data: account, status: 200 });
    } catch (error) {
      return next(error);
    }
  });

  // Handle delete account
  router.delete("/", requireAuth, async function (req, res, next) {
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
