const cron = require("node-cron");
const { Agent } = require("../models");
const { NotFoundError } = require("../utilities/expressError");

class ActiveAgent {
  constructor(agent) {
    this.agent = agent
    this.agentId = agent.agentId; // I think this is redundant with the line above
    this.socialTask = null; // TODO: nodecron task
    this.blogTask = null; // TODO: nodecron task
  }
  // async initialize(agentId) {
  //   console.log("initializing")
  //   this.agent = await Agent.findByPk(agentId);
  //   console.log("initialized")
  // }
}

class ActiveAgents extends Map {
  // comes with get, set, delete methods
  constructor() {
    super();
    this.#loadActive();
  }
  // Function will either add/update a post task or a social task
  // needs to get the agent from map if it exists. If it doesn't exist, create it in the Map. THEN, update the respective task: social or post
  add(agent) {
    console.log(`ADDING ACTIVE AGENT: ${agent}`);
    console.log(`getting agent: ${this.get(agent)}`);
    const activeAgent = this.get(agent.agentId) ?? new ActiveAgent(agent);
    console.log(`activeAgent: ${activeAgent}`);
    console.dir(activeAgent);
    const { socialSettings, postSettings } = activeAgent;

    // Check if SOCIAL is enabled and create task if neccessary
    if (agent.socialSettings.isEnabled) {
      if (agent.socialTask) agent.socialTask.stop(); // stop any active task
      const task = cron.schedule(
        agent.socialSettings.cronSchedule,
        async () => {
          console.log(`Running Autosocial for ${username}`);
          try {
            // PRIMARY FUNCTON
            // await this.writePost();
            console.log(`Finished Autosocial for ${username}`);
          } catch (error) {
            console.log(`Error trying to Autosocial for ${username}:`, error);
          }
        },
        {
          scheduled: false,
          timezone: agent.socialSettings.timezone,
        }
      );
      task.start(); // start the task
      activeAgent.socialtask = task; // node cron object
    }

    // Check if POST is enabled and create task if neccessary
    if (agent.postSettings.isEnabled) {
      if (agent.blogTask) agent.blogTask.stop(); // stop any active task
      const task = cron.schedule(
        agent.postSettings.cronSchedule,
        async () => {
          console.log(`Running Autoblog for ${username}`);
          try {
            // PRIMARY FUNCTON
            // await this.writePost();
            console.log(`Finished Autoblog for ${username}`);
          } catch (error) {
            console.log(`Error trying to Autoblog for ${username}:`, error);
          }
        },
        {
          scheduled: false,
          timezone: agent.postSettings.timezone,
        }
      );
      task.start(); // start the task

      activeAgent.blogTask = task; // node cron object
    }
    // Save the updated agent under its agentId
    let aa = this.set(agent.agentId, activeAgent);
    console.log(`Finished setting new active agent`);
    console.log(`Current Active Agents:`);
    console.dir(this);
    return aa;
  }
  remove(agentId) {
    const agent = this.get(agentId);
    if (!agent) {
      // already inactive
      console.log("Agent is already inactive");
      return;
    } 
    console.log(`REMOVING ACTIVE AGENT: ${agentId}`);
    // stop any active blog or social task
    if (agent.blogTask) agent.blogTask.stop();
    if (agent.socialTask) agent.socialTask.stop();

    this.delete(agentId); // remove from active agents.
    console.log("current active agents:");
    console.dir(this);
    return { message: "deactivated" };
  }
  async #loadActive() {
    const agents = await Agent.findAll({
      where: {
        isEnabled: true,
      },
    });
    for (let agent of agents) {
      this.add(agent); // run the add function for each active agent
      console.log(`LOADED ACTIVE AGENT: ${agent.username}`);
    }
  } // do it on server start. Combine with constructor?
}

const ACTIVE_AGENTS = new ActiveAgents();
// ACTIVE_AGENTS.loadActive()
console.log(`FINISHED LOADING ACTIVE AGENTS`);

module.exports = ACTIVE_AGENTS;
