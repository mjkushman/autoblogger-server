"use strict";

// Routes for creating and utilizing AI authors

const express = require("express");
const router = express.Router({ mergeParams: true });
// const jsonschema = require("jsonschema");
// const agentCreateSchema = require("./agentCreateSchema.json");

const { UnauthorizedError } = require("../../utilities/expressError");
const AgentService = require("../../services/AgentService");
import { BadRequestError } from "openai";
import validatePostSettings from "../../utilities/validatePostSettings";

module.exports = (config) => {
  /** GET returns a list of all agents for an account
   *
   */
  router.get("/", async function (req, res, next) {
    console.log("route: finding all agents");
    try {
      const { accountId } = res.locals;
      const result = await AgentService.findAll({ accountId });
      return res.sendResponse({ data: result, status: 200 });
    } catch (error) {
      next(error);
    }
  });

  /** GET returns one agent for an account
   *
   */
  router.get("/:agentId", async function (req, res, next) {
    try {
      console.log("route: finding one agent");
      const { accountId } = res.locals;
      const { agentId } = req.params;
      const result = await AgentService.findOne({ agentId, accountId });
      return res.sendResponse({ data: result, status: 200 });
    } catch (error) {
      next(error);
    }
  });

  /** Creates a new Agent.
   *
   * Expects the request to have necessary information to create a new author
   */
  router.post("/", async function (req, res, next) {
    console.log("HIT AGENT POST '/'");
    // TODO: Validate the schema

    // Upon valid schema, attempt to create the agent

    try {
      console.log("trying: agent post route");

      const { body } = req;
      const { accountId } = res.locals;

      if (!validatePostSettings(body.postSettings)) {

        res.status(400).send(new BadRequestError("Invalid post settings"));
      }

      const agent = await AgentService.create({ body, accountId });

      return res.sendResponse({ data: agent, status: 201 });
    } catch (error) {
      console.log("catching error:", error);
      return next(error);
    }

  });

  /** Update settings to the agent
   */

  router.patch("/", async function (req, res, next) {
    console.log("HIT AGENT PATCH '/'");
    try {
      // Verify that the agent being updated belongs to the same org as the user making the update
      const { body } = req;
      const { accountId } = res.locals;
      const { agentId } = req.body;
      console.log("agentId", agentId);
      // const ownedAgents = account.Agents.map((a) => a.agentId)

      // if(!ownedAgents.includes(agentId)) throw new UnauthorizedError("You may only modify agents that belong to your account.")
      const result = await AgentService.update({ accountId, agentId, body });
      console.log("PATCH result:", result);
      return res.sendResponse({ data: result, status: 200 });
    } catch (error) {
      next(error);
    }
  });

  /** Delete this agent entirely */
  router.delete("/", async function (req, res, next) {
    try {
      const { accountId } = res.locals;
      const { agentId } = req.body;

      const result = await AgentService.delete({ accountId, agentId });
      return res.sendResponse({ data: result, status: 200 });
    } catch (error) {
      next(error);
    }
  });

  return router;
};
