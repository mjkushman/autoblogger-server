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
} = require("../utilities/expressError");
// const Agent = require("./models/Agent");
const AgentService = require("../services/AgentService");

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

  /** Creates a new AI Agent.
   *
   * Expects the request to have necessary information to create a new author
   */
  router.post("/", async function (req, res, next) {
    console.log("ROUTE: POST agentRoutes");
    // // Validate the schema
    // const validator = jsonschema.validate(req.body, agentCreateSchema);
    // if (!validator.valid) {
    //   let errorMessage = new BadRequestError();
    //   const errors = validator.errors.map((e) => e.stack);
    //   errorMessage = { ...errorMessage, errors };
    //   return res.json({errorMessage,});
    // }

    // Upon valid schema, attempt to create the agent
    try {
      console.log("trying: agent post route");
      const { body, account } = req;
      const { accountId } = account;
      return res
        .status(201)
        .json(await AgentService.create({ body, accountId }));
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
      // // Validate the request's schema
      // const validator = jsonschema.validate(req.body, agentUpdateSchema);
      // if (!validator.valid) {

      //     let errorMessage = new BadRequestError();
      //     const errors = validator.errors.map((e) => e.stack);
      //     errorMessage = { ...errorMessage, errors };
      //     return res.json({errorMessage,});
      // }

      // Verify that the agent being updated belongs to the same org as the user making the update
      const { body, account } = req;
      const { accountId } = account;
      const { agentId } = req.params;
      const agent = await AgentService.update({ accountId, agentId, body });
      return res.status(201).json(agent);
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
      const result = await AgentService.delete({ accountId, agentId });
      return res.status(200).json(result)
    } catch (error) {
      next(error)
    }
  });

  // === AI AGENT FUNCTIONS

  // /** Sanity check: INITIATING AGENT
  //  * This route should not actually be needed by the ai agent or app
  //  */
  // router.get("/:agentId/init", async function (req, res, next) {
  //     console.log('AGENT INIT request received')
  //     const agentId = req.params.agentId
  //     let agent = await AiAgent.init(agentId)
  //     console.dir(agent)

  //     return res.status(200).json({ message: "received", status: 200 });
  // });

  // /** Manually create a new blog post */
  // router.post("/:agentId/blog", async function (req, res, next) {
  //     console.log('AGENT BLOG request received')
  //     const agentId = req.params.agentId
  //     // let {llm, maxWords} = req.body
  //     console.log('body dir:')
  //     console.dir(req.body)

  //     let agent = await AiAgent.init(agentId)
  //     console.log("Agent invoked:")
  //     console.dir(agent)

  //     let blogPost = await agent.writeBlogPost(req.body)

  //     return res.status(201).json({blogPost})

  // });

  /** Manually create a new social post */
  router.post("/:authorId/social", async function (req, res, next) {});

  return router;
};
