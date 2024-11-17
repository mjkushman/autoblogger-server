"use strict";

// Routes for creating and utilizing AI authors

const express = require("express");
const router = express.Router({ mergeParams: true });
// const jsonschema = require("jsonschema");
// const agentCreateSchema = require("./agentCreateSchema.json");

const {
  BadRequestError,
  ExpressError,
  UnauthorizedError,
} = require("../../utilities/expressError");
// const Agent = require("./models/Agent");
const AgentService = require("../../services/AgentService");
const PostService = require("../../services/PostService");

module.exports = (config) => {
  /** GET returns a list of all agents for an account
   *
   */
  router.get("/", async function (req, res, next) {
    try {
      const { accountId } = req.account;
      const agents = await AgentService.findAll({ accountId });
      return res.sendResponse({status:200, data: agents})
    } catch (error) {
      next(error);
    }
  });
  /** GET returns a list of all agents for an account
   *
   */
  router.get("/hello", async function (req, res, next) {
    try {
      console.log("saying hello");
      const { accountId } = req.account;
      const result = await AgentService.sayHello({ accountId });
      return res.sendResponse({status:200, data: result})
    } catch (error) {
      next(error);
    }
  });
  /** GET returns one agent for an account
   *
   */
  router.get("/:agentId", async function (req, res, next) {
    try {
      const { accountId } = req.account;
      const { agentId } = req.params;
      const agent = await AgentService.findOne({ agentId, accountId });
      return res.sendResponse({status:200, data: agent})
    } catch (error) {
      next(error);
    }
  });

  // Mostly just used to test the service for getting titles.
  router.get("/:agentId/titles", async function (req, res, next) {
    try {
      const { accountId } = req.account;
      const { agentId } = req.params;
      const agent = await AgentService.findOne({ accountId, agentId });
      if (!agent) throw new NotFoundError("Unable to find agent");
      const titles = await PostService.findRecentTitles({
        agentId: agent.agentId,
      });
      return res.sendResponse({status:200, data: titles})
    } catch (error) {
      next(error);
    }
  });

  /** Creates a new AI Agent.
   *
   * Expects the request to have necessary information to create a new author
   */
  router.post("/", async function (req, res, next) {
    try {
      const { body, account } = req;
      const { accountId } = account;
      const agent = await AgentService.create({ body, accountId })
      return res.sendResponse({status:201, data: agent})
    } catch (error) {
      next(error);
    }

    // if newBlogger.active == true
    // newBlogger.activate() ==> uses node cron to start a task based on the current settings, defined in model
  });

  /** Update settings to the agent
   * @param :agentId determines which agent they want to update
   * Middleware should verify that orgId in the user's token matches the orgId of the agent they want to update.
   *
   *
   */
  router.patch("/:agentId", async function (req, res, next) {
    try {
      // Verify that the agent being updated belongs to the same org as the user making the update
      const { body, account } = req;
      const { accountId } = req;
      const { agentId } = req.params;
      const ownedAgents = account.Agents.map((a) => a.agentId)
      
      if(!ownedAgents.includes(agentId)) throw new UnauthorizedError("You may only modify agents that belong to your account.")
      const result = await AgentService.update({ accountId, agentId, body });
      return res.sendResponse({status:200, data: result})
    } catch (error) {
      next(error);
    }
  });
  
  // convenience method for easy activation / deactivation
  router.post("/:agentId/activate", async function (req, res, next) {
    try {
      const { account } = req;
      const { accountId } = account;
      const { agentId } = req.params;
      const ownedAgents = account.Agents.map((a) => a.agentId)
      if(!ownedAgents.includes(agentId)) throw new UnauthorizedError("You may only modify agents that belong to your account.")
      // const agent = await AgentService.activate({ accountId, agentId });
      return res.sendResponse({status:201, data: agent})
    } catch (error) {
      next(error);
    }
  });
  // convenience method for easy activation / deactivation
  router.post("/:agentId/deactivate", async function (req, res, next) {
    try {
      const { account } = req;
      const { accountId } = account;
      const { agentId } = req.params;
      const ownedAgents = account.Agents.map((a) => a.agentId)
      if(!ownedAgents.includes(agentId)) throw new UnauthorizedError("You may only modify agents that belong to your account.")
      // const agent = await AgentService.deactivate({ accountId, agentId });
      return res.sendResponse({status:201, data: agent})
    } catch (error) {
      next(error);
    }
  });

  /** Delete this agent entirely */
  router.delete("/:agentId", async function (req, res, next) {
    try {
      const { account } = req;
      const { accountId } = account;
      const { agentId } = req.params;
      const ownedAgents = account.Agents.map((a) => a.agentId)
      if(!ownedAgents.includes(agentId)) throw new UnauthorizedError("You may only modify agents that belong to your account.")
      const result = await AgentService.delete({ accountId, agentId });
      return res.sendResponse({status:200, data: result})
    } catch (error) {
      next(error);
    }
  });

  // DEPRECATE THIS METHOD
  // Instead, hit /post with agentid in payload to have that agent invoke writePost

  /** Manually trigger agent to create a new blog post
   * @Param options exptects a JSON object { llm, maxWords, topic,
   * }
   */
  router.post("/:agentId/post", async function (req, res, next) {
    console.log("AGENT POST request received");
    try {
      const { account } = req;
      const { accountId } = account;
      const { agentId } = req.params;
      let { body: options } = req;
      let post = await AgentService.writePost({ agentId, options });
      return res.sendResponse({status:201, data: post})
    } catch (error) {
      next(error);
    }
  });

  /** Manually create a new social post */
  // router.post("/:agentId/social", async function (req, res, next) {});

  return router;
};
