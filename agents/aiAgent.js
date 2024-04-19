// Define the ai agent class. Final naming tbd. Could be agent or author or something else. This is the new aiBlogger.js

const cron = require("node-cron");
const Agent = require("./agentModel");
const Post = require("../models/post");
const { ExpressError } = require("../expressError");
const LLMService = require('../utilities/llmService')

class AiAgent extends LLMService{
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
    super()
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

  // CLASS PROPERTIES
  static AGENTS = new Map();


  // STATIC METHODS

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



  static async enableAll() {
    // retreives all agents and starts the ones that should be started. Use this class method when the server starts up.
  }

  static async disableAll() {
    // deactivates all currently running agents
  }



  // CLASS METHODS

  /**
   * Returns a string formatted list of recent titles
   *   1. "My first article"
   *   2. "Another article I wrote"
   *   ...etc
   */
  async getRecentWork(){
    let recentWork = ''
    
    try {
      
      console.log(`Getting recent work for ${this.username}`)
      const titlesArray = await Post.getTitles(this.agentId).map(
        ({ titlePlaintext }) => titlePlaintext )
       
      for(let i=0; i<= (Math.min(14, titlesArray.length)); i++) {
        recentWork += `${Number(i) +1}. "${titlesArray[i]}"\n`
       }
       return recentWork
      
    } catch (error) {
      return new ExpressError(`Could not retreive recent work for ${this.username}. ${error}`)
    }
  }

  /** Asks LLM to decide on a new topic to write about, based on the author's bio and recent work.
   * @returns String: An outline of the next article to write when calling writeBlogPost
   */
  async decideBlogTopic(){
    console.log(`${this.username} is deciding on a new blog topic.`)
    let recentWork = await this.getRecentWork()
    
    // Prompt construction:
    let messages = [
      { role: "system", content: ` You're an author of a popular blog. 
      This is your author profile: 
      ${this.authorBio}
      
      These are the recent articles you wrote:\n
      ${recentWork}
      ` },
      { role: "user", content: `Given your author profile and recent works, choose a topic for your next blog post. The new post should be different from other things you've written, but still written in your voice. Create a brief outline of your next blog post.` }
    ]
    
    try {
      return await super.promptLLM(messages, llm="chatgpt") 
    } catch (error) {
      return new ExpressError(`${this.username} was unable to prompt LLM to decide on a topic.  ${error}`)
    }
    
  }



  async writeBlogPost(topic, llm="chatgpt") {
    // writes a blog post
    /** 
     * 1. Input should be a specific topic, if any. If none provided, call decideBlogTopic first
     * 2. Construct a prompt called "messages"
     * 3. pass the prompt to llm service
     * 4. Do additional stuff with the response from llm service
     * 
     * 
     */
    
    // if no topic is provided, decide one
    topic = topic || this.decideBlogTopic() 
    


    // Construct messages


    
    // invoke llm
    super.promptLLM(llm,messages)



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
