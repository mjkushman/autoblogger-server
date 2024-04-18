// Define the ai agent class. Final naming tbd. Could be agent or author or something else. This is the new aiBlogger.js

const cron = require("node-cron");
const Agent = require("./agentModel");
const { ExpressError } = require("../expressError");

class AiAgent {
  // commenting this out because I'm trying another approach.
  // Instead of instantiating with "... new AiAgent(id)" I will instantiate with AiAgent.init(id)

  constructor({
    firstName,
    lastName,
    authorBio,
    imageUrl,
    isEnabled,
    schedule,
    email,
    agentId,
    orgId,
    username,
  }) {
    this.agentId = agentId;
    this.orgId = orgId;
    this.username = username;
    this.firstName = firstName;
    this.lastName = lastName;
    this.isEnabled = isEnabled;
    this.email = email;
    this.schedule = schedule;
    this.authorBio = authorBio;
    this.imageUrl = imageUrl;
  }

  // Retrieve the agent's details from databse and set instance properties
  static async init(agentId) {
    try {
      const agentData = await Agent.getAgent(agentId);
      if (agentData) {
        return new AiAgent(agentData); // returns a new class instance with populated constructor fields.
      } else {
        console.log(`Unable to find an agent with that agentId ${agentId}`);
      }
    } catch (error) {
      return new ExpressError(error);
    }
  }

  // return author info to populate fields below

  // class properties
  static AGENTS = new Map();

  // static methods

  static async enableAll() {
    // retreives all agents and starts the ones that should be started. Use this class method when the server starts up.
  }

  static async disableAll() {
    // deactivates all currently running agents
  }

  // instance methods. These act on a single instance

  writeBlogPost() {
    // writes a blog post
  }

  writeSocialPost() {
    // writes a new social post
  }


  /** Starts running this agent according to their schedules and adds this agent to AGENTS 
   *  Future refactoringL: Abstract the scheduling function into its own function to be called for each schedule (blog, social, others in the future)
   *  */ 
  enable() {
    this.disable() // First, makes sure it's not already running.
    let tasks = []
    
    // set blogging schedule
    if(this.isEnabled && this.schedule.blog){
      const blogTask = cron.schedule(this.schedule.blog, async () => {
          console.log(`Running AI blogger for ${this.username}`);
          try {
            await this.writeBlogPost();
            console.log(`Finished running ${this.username}`);
          } catch (error) {
            console.log(`Error trying to write blog post for ${this.username}:`, error);
          }},
          {
          scheduled: this.isEnabled,
          timezone: "America/Los_Angeles",
        }
      ); 
      tasks.push(blogTask)
    }
    // set social schedule
    if(this.isEnabled && this.schedule.social){
      const socialTask = cron.schedule(this.schedule.social, async () => {
          console.log(`Running AI social for ${this.username}`);
          try {
            await this.writeSocialPost();
            console.log(`Finished running ${this.username}`);
          } catch (error) {
            console.log(`Error trying to write social post for ${this.username}:`, error);
          }},
          {
          scheduled: this.isEnabled,
          timezone: "America/Los_Angeles",
        }
      ); 
      tasks.push(socialTask)
    }

    // Sets an array of tasks at agentId
    AGENTS.set(this.agentId, tasks)
  }


  disable() {
    // Ends the recurring tasks from this agent
    // Remove it from AGENTS
    const tasks = AGENTS.get(this.agentId)
    if(tasks) {
      for(const task of tasks) task.stop();
    }
    AGENTS.delete(this.agentId)
  }
}
module.exports = AiAgent;
