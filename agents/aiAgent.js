// Define the ai agent class. Final naming tbd. Could be agent or author or something else. This is the new aiBlogger.js

const cron = require("node-cron");
const Agent = require("./agentModel");
const Post = require("../models/post");
const { ExpressError } = require("../expressError");
const LLMService = require('../utilities/llmService')
const htmlParser = require('../utilities/htmlParser')

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
   *   1. "My first article"
   *   2. "Another article I wrote"
   *   ...etc
   * @returns string formatted list of recent titles
   */
  async #getRecentWork(){
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
   * @returns Topic.: An outline of the next article to write when calling writeBlogPost
   */
  async #decideBlogTopic(llm){
    console.log(`${this.username} is deciding what topic to write about`)
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
      const response = await super.promptLLM(messages, llm="chatgpt") 
      console.log(`${this.username} finished deciding what topic to write about.`)
      return response
    } catch (error) {
      return new ExpressError(`${this.username} was unable to prompt LLM to decide on a topic.  ${error}`)
    }
    
  }



  async writeBlogPost(topic, llm="chatgpt", wordLimit) {
    // 
    /** Writes a blog post
     * @topic An outline of the post to be written, which helps the AI write. Optional. If non is provided, the AI will run a utility function to choose a topic.
     * @param llm the name of the large language model to use. "chatgpt" | "claude" 
     * @param wordLimit The maximum wordcount in the returned blog post
     * @returns a blog in string formatted HTML
     */
    
    // If no topic is provided, decide one
    console.log(`${this.username} has started writing a blog post`)
    topic = topic || this.decideBlogTopic() 
    
    // Construct messages
    let messages = [
      {
        role: "system",
        content: `You are the author of a popular blog. This is your profile: ${this.authorBio}`,
      },
      {
        role: "user",
        content: `
        Write a new blog post using the following outline and instructions.
        OUTLINE:
        ${topic}


        INSTRUCTIONS:
        1. Complete the post with fewer than ${wordLimit} words.
        2. Format the response in HTML with proper HTML tags.
        3. Include a title in <h1> tags.
        4. Wrap the rest of the post in a <div> tag with id="primary-content".
        5. But do not include any boilerplate HTML`,
      },
    ]

  
    // Invoke llm
    console.log(`${this.username} gas started writing a blog post.`)
    const htmlPost = await super.promptLLM(llm,messages)
    console.log(`${this.username} finished writing a blog post.`)
    
    // Parse and format html resposne from llm
    let postData = htmlParser(htmlPost)
    
    // Get a random image based on the post title
    const imageUrl = await getUnsplashImage(postData.titlePlaintext)
    
    // Save the post to databse
    postData = {...postData, imageUrl: String(imageUrl), userId:this.agentId}
    const newPost = await savePost(postData)
    return newPost

    
  }
  
  /** Formats the post and saves it to the databse
   * @param postData Data of the newly sourced post from LLM
   */
  async #savePost(postData){
    

    // Add the article to database
    try {
      const newPost = await Post.createNewPost(postData);
      console.log(`
      New post created!
      postId: ${newPost.postId}
      Author: ${newPost.userId}
      Title: ${newPost.titlePlaintext}
      Image: ${newPost.imageUrl}
      Created at: ${newPost.createdAt}`);
  
      return newPost;
      
    } catch (error) {
      console.log('error creating post:',error)
    }  


  }

  // TODO: Write a social media post
  writeSocialPost() {
    // does something
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
