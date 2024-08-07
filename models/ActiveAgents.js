const cron = require("node-cron");
const { Agent } = require("../models");

class ActiveAgent {
    constructor(agentId) {
      this.agent = () => Agent.findOne(agentId);
      this.socialTask = null; // TODO: nodecron task
      this.blogTask = null; // TODO: nodecron task
    }
  }
  
  class ActiveAgents extends Map {
    // comes with get, set, delete methods
  
    // Function will either add/update a post task or a social task
    // needs to get the agent from map if it exists. If it doesn't exist, create it in the Map. THEN, update the respective task: social or post
    add(agentId) {
      const agent = this.agents.get(agentId) || new ActiveAgent(agentId);
      const { socialSettings, postSettings, username } = agent;
  
      // Check if SOCIAL is enabled and create task if neccessary
      if (agent.socialSettings.isEnabled) {
        if (agent.socialTask) agent.socialTask.stop(); // stop any active task
        const task = cron.schedule(
          socialSettings.cronSchedule,
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
            timezone: socialSettings.timezone,
          }
        );
        task.start(); // start the task
        agent.socialtask = task; // node cron object
      }
  
      // Check if POST is enabled and create task if neccessary
      if (agent.postSettings.isEnabled) {
        if (agent.blogTask) agent.blogTask.stop(); // stop any active task
        const task = cron.schedule(
          postSettings.cronSchedule,
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
            timezone: postSettings.timezone,
          }
        );
        task.start(); // start the task
  
        agent.blogTask = task; // node cron object
      }
      // Save the updated agent under its agentId
      return this.set(agentId, agent);
    }
    remove(agentId) {
      const agent = this.get(agentId);
      if (!agent) throw new NotFoundError("Agent is not active");
      // stop any active blog or social task
      if (agent.blogTask) agent.blogTask.stop();
      if (agent.socialTask) agent.socialTask.stop();
      return this.delete(agentId); // remove from active agents.
    }
    async loadActive() {
      const agents = await Agent.findAll({where: {
        isEnabled: true
      }})
      for(let agent of agents) {
        this.add(agent.agentId) // run the add function for each active agent
      }
    } // do it on server start. Combine with constructor?
  }
  
  const ACTIVE_AGENTS = new ActiveAgents().loadActive();


  module.exports = ACTIVE_AGENTS