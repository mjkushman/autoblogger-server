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
  /** GET returns a list of all agents
   *
   */
  router.get("/", async function (req, res, next) {
    try {
      console.log('route: finding all agents')
      const response = await AgentService.findAll();
      return res.status(200).json(response);
    } catch (error) {
      let errorMessage = new BadRequestError(error);
      return res.send('nope')
    }
  });

  /** GET: Retrieve a list of agents for this orgId
   * @param orgId should be sent as a query param
   * .../?orgId => returns agents for that org
   * TODO: allow orgId to be included in request header. Use middleware to verify
   */
  router.get("/", async function (req, res, next) {
    try {
      const orgId = req.query.orgId;
      const agents = await Agent.getOrgAgents(orgId);

      return res.json({
        message: `You requested agents for orgId: ${orgId}`,
        agents: agents,
      });
    } catch (error) {
      let errorMessage = new BadRequestError();

      return res.json({ errorMessage });
    }
  });

  /** Creates a new AI Agent.
   *
   * Expects the request to have necessary information to create a new author
   */
  router.post("/", async function (req, res, next) {
    console.log('ROUTE: POST agentRoutes')
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
      console.log('trying: agent post route')
      const {body, account} = req
      body.accountId = account.accountId // attach account ID
      return res.send(await AgentService.create(body))
    } catch (error) {
      // res.send(error);
      next(error)
    }

    // if newBlogger.active == true
    // newBlogger.activate() ==> uses node cron to start a task based on the current settings, defined in model
  });

  // /** Update settings to the agent
  //  * @param :agentId determines which agent they want to update
  //  * Middleware should verify that orgId in the user's token matches the orgId of the agent they want to update.
  //  *
  //  *
  //  */
  // router.patch("/:agentId", async function (req, res, next) {
  //   try {
  //     // Validate the request's schema
  //     const validator = jsonschema.validate(req.body, agentUpdateSchema);
  //     if (!validator.valid) {

  //         let errorMessage = new BadRequestError();
  //         const errors = validator.errors.map((e) => e.stack);
  //         errorMessage = { ...errorMessage, errors };
  //         return res.json({errorMessage,});
  //     }

  //     // Verify that the agent being updated belongs to the same org as the user making the update
  //     const agentId = req.params.agentId;
  //     const agent = new Agent(agentId);
  //     if (agent.orgId !== res.locals.orgId) return UnauthorizedError;

  //     let { updateCols, updateVals } = updateUserSql(req.body);
  //   } catch (error) {

  //   }
  // });

  // /** Delete this agent entirely */
  // router.delete("/:agentId", async function (req, res, next) {});

  // // === AI AGENT FUNCTIONS

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
