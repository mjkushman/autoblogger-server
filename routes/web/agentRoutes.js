"use strict";

// Routes for creating and utilizing AI authors

const express = require("express");
const router = express.Router({ mergeParams: true });
// const jsonschema = require("jsonschema");
// const agentCreateSchema = require("./agentCreateSchema.json");
const responseHandler = require('../../middleware/responseHandler')
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
      console.log("route: finding all agents");
      const { accountId } = req.account;
      const response = await AgentService.findAll({ accountId });
      return res.status(200).json(response);
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
      const response = await AgentService.sayHello({ accountId });
      return res.status(200).json(response);
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
      const { accountId } = req.account;
      const { agentId } = req.params;
      const response = await AgentService.findOne({ agentId, accountId });
      return res.status(200).json(response);
    } catch (error) {
      // let errorMessage = new BadRequestError(error);
      next(error);
    }
  });

  // Mostly just used to test the service for getting titles.
  router.get("/:agentId/titles", async function (req, res, next) {
    try {
      console.log("route: finding titles for one agent");
      const { accountId } = req.account;
      const { agentId } = req.params;
      const agent = await AgentService.findOne({ accountId, agentId });
      if (!agent) throw new NotFoundError("Unable to find agent");
      const response = await PostService.findRecentTitles({
        agentId: agent.agentId,
      });
      return res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  });

  /** Creates a new AI Agent.
   *
   * Expects the request to have necessary information to create a new author
   */
  router.post("/" , responseHandler, async function (req, res, next) {
    console.log("HIT AGENT POST '/'")
    // TODO: Validate the schema

    // Upon valid schema, attempt to create the agent
    try {
      console.log("trying: agent post route");
      const { body, user } = req;
      const { accountId } = user;
      const agent = await AgentService.create({ body, accountId })
      
      return res.sendResponse(agent, 201)
    } catch (error) {
      console.log('catching error:', error)
      next(error);
    }

    // if newBlogger.active == true
    // newBlogger.activate() ==> uses node cron to start a task based on the current settings, defined in model
  });

  /** Update settings to the agent
   */
  
  // THIS REPLACES THE PATCH WITH /:agentId
  router.patch("/", async function (req, res, next) {
    console.log("HIT AGENT PATCH '/'")
    try {
      // Verify that the agent being updated belongs to the same org as the user making the update
      const { body, user } = req;
      const { accountId } = user;
      const { agentId } = req.body;
      console.log("agentId",agentId)
      // const ownedAgents = account.Agents.map((a) => a.agentId)
      
      // if(!ownedAgents.includes(agentId)) throw new UnauthorizedError("You may only modify agents that belong to your account.")
      const result = await AgentService.update({ accountId, agentId, body });
      return res.status(200).json(result);
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
      return res.status(201).json(agent);
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
      return res.status(201).json(agent);
    } catch (error) {
      next(error);
    }
  });

  /** Delete this agent entirely */
  router.delete("/", async function (req, res, next) {
    try {
      const { accountId } = req.user;
      const { agentId } = req.body;
      // const ownedAgents = account.Agents.map((a) => a.agentId)
      // if(!ownedAgents.includes(agentId)) throw new UnauthorizedError("You may only modify agents that belong to your account.")
      const result = await AgentService.delete({ accountId, agentId });
      return res.status(200).json(result);
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
      return res.status(201).json({ post });
    } catch (error) {
      next(error);
    }
  });

  /** Manually create a new social post */
  router.post("/:agentId/social", async function (req, res, next) {});

  return router;
};
