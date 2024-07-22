// Define the ai agent class. Final naming tbd. Could be agent or author or something else. This is the new aiBlogger.js

const cron = require("node-cron");
const { Agent, Post } = require("../models");
const { ExpressError } = require("../utilities/expressError");
const LLMService = require("../services/LLMService");
const htmlParser = require("../utilities/htmlParser");
const getUnsplashImage = require("../utilities/getUnsplashImage");

class AgentService extends LLMService {
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
    super();
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

  // === CLASS PROPERTIES ===
  static AGENTS = new Map();

  // == INSTANCE PROPERTIES ==
  bioBlock = this.authorBio
    ? `\n This is your profile: ${this.authorBio.length}`
    : "";

  // === STATIC METHODS ===

  /** Retrieve the agent's details from databse and set instance properties
   *  @returns new AiAgent class instance with instance properties set
   *
   *  */
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

  static async findAll() {
    console.log("service: finding all agents");
    try {
      console.log("trying");
      let agents = await Agent.findAll();
      console.log("AGENTS FROM DB", agents);
      return agents;
    } catch (error) {
      console.log("catching");
      console.log("Error:", error);
      return error;
    }
  }
  static async create(body) {
    console.log("service: creating a new agent");
    try {
      console.log("trying");

      return await Agent.create(body);
    } catch (error) {
      console.log("catching");
      let errorStack = error.errors.map(({ type, message }) => ({
        type,
        message,
      }));
      return { errors: errorStack };
    }
  }

  static async enableAll() {
    // retreives all agents and starts the ones that should be started. Use this class method when the server starts up.
  }

  static async disableAll() {
    // deactivates all currently running agents
  }

  // CLASS METHODS

  /** Writes a blog post
   * @topic An outline of the post to be written, which helps the AI write. Optional. If non is provided, the AI will run a utility function to choose a topic.
   * @param llm the name of the large language model to use. "chatgpt" | "claude"
   * @param maxWords The maximum wordcount in the returned blog post
   * @returns a blog in string formatted HTML
   */
  async writeBlogPost({ topic, llm = "chatgpt", maxWords = 1000 }) {
    console.log(`${this.username} has started writing a blog post: 
      llm: ${llm}
      maxWords: ${maxWords}
      topic: ${topic}`);

    // If no topic is provided, decide one
    const topicBlock = topic || (await this.#decideBlogTopic());
    console.log(`Next blog topic: ${topicBlock}`);

    // Construct messages
    let messages = [
      {
        role: "system",
        content: `You are the author of a popular blog. ${this.bioBlock}`,
      },
      {
        role: "user",
        content: `
        Write a new blog post using the following outline and instructions.
        OUTLINE:
        ${topicBlock}


        INSTRUCTIONS:
        1. Expand upon the topic until you reach ${maxWords} words.
        2. Format the response in HTML with proper HTML tags.
        3. Include a title in <h1> tags.
        4. Wrap the rest of the post in a <div> tag with id="primary-content".
        5. But do not include any boilerplate HTML`,
      },
    ];

    // Invoke llm
    console.log(
      `${this.username} is about to invoke the LLM to write a blog post.`
    );
    const llmResponse = await super.promptLLM(messages, llm);
    console.log(`${this.username} finished invoking the LLM.`);
    // console.log(`LLM Response: ${llmResponse}`);

    // Parse and format html resposne from llm
    let postData = htmlParser(llmResponse);

    // Get a random image based on the post title
    const imageUrl = await getUnsplashImage(postData.titlePlaintext);
    console.log("sourced image url: ".imageUrl);

    // Save the post to databse
    postData = {
      ...postData,
      imageUrl: String(imageUrl),
      agentId: this.agentId,
    };
    console.log(`${this.username}'s postData about to be saved to db:`);
    console.dir(postData);
    const newPost = await this.#savePost(postData);
    return newPost;
  }

  /** Starts running this agent according to their schedules and adds this agent to AGENTS
   *  Future refactoringL: Abstract the scheduling function into its own function to be called for each schedule (blog, social, others in the future)
   *  */
  enable() {
    this.disable(); // First makes sure it's not already running.
    let tasks = [];

    // set blogging schedule
    if (this.isEnabled && this.schedule.blog) {
      const blogTask = cron.schedule(
        this.schedule.blog,
        async () => {
          console.log(`Running AI blogger for ${this.username}`);
          try {
            await this.writeBlogPost();
            console.log(`Finished running ${this.username}`);
          } catch (error) {
            console.log(
              `Error trying to write blog post for ${this.username}:`,
              error
            );
          }
        },
        {
          scheduled: this.isEnabled,
          timezone: "America/Los_Angeles",
        }
      );
      tasks.push(blogTask);
    }
    // set social schedule
    if (this.isEnabled && this.schedule.social) {
      const socialTask = cron.schedule(
        this.schedule.social,
        async () => {
          console.log(`Running AI social for ${this.username}`);
          try {
            await this.writeSocialPost();
            console.log(`Finished running ${this.username}`);
          } catch (error) {
            console.log(
              `Error trying to write social post for ${this.username}:`,
              error
            );
          }
        },
        {
          scheduled: this.isEnabled,
          timezone: "America/Los_Angeles",
        }
      );
      tasks.push(socialTask);
    }

    // Sets an array of tasks at agentId
    AGENTS.set(this.agentId, tasks);
  }

  disable() {
    // Ends the recurring tasks from this agent
    // Remove it from AGENTS
    const tasks = AGENTS.get(this.agentId);
    if (tasks) {
      for (const task of tasks) task.stop();
    }
    AGENTS.delete(this.agentId);
  }

  // ===PRIVATE HELPER METHODS===

  /** Formats the post and saves it to the databse
   * @param postData Data of the newly sourced post from LLM
   */
  async #savePost(postData) {
    // Add the article to database

    try {
      const newPost = await Post.createNewPost(postData);

      console.log(`
      New post created!
      postId: ${newPost.postId}
      Author: ${newPost.userId}
      Agent ID: ${newPost.agentId}
      Title: ${newPost.titlePlaintext}
      Image URL: ${newPost.imageUrl}
      Created at: ${newPost.createdAt}`);

      return newPost;
    } catch (error) {
      console.log("error creating post:", error);

      return new ExpressError(error);
    }
  }

  /** Produces a list like
   *   1. "My first article"
   *   2. "Another article I wrote"
   *   ...etc
   * @returns string formatted list of recent titles or an empty string if this agent has not written anything
   */
  async #getRecentWork() {
    let recentWork = "";

    try {
      console.log(`${this.username} is getting recent work.`);
      const titlesResponse = await Post.getTitles(this.agentId);

      if (titlesResponse.length > 0) {
        let titlesArray = titlesResponse.map(
          ({ titlePlaintext }) => titlePlaintext
        );
        for (let i = 0; i <= Math.min(14, titlesArray.length); i++) {
          recentWork += `${Number(i) + 1}. "${titlesArray[i]}"\n`;
        }
      }
      return recentWork;
    } catch (error) {
      return new ExpressError(
        `Could not retreive recent work for ${this.username}. ${error}`
      );
    }
  }

  /** Asks LLM to decide on a new topic to write about, based on the author's bio and recent work.
   * @returns Topic.: An outline of the next article to write when calling writeBlogPost
   */
  async #decideBlogTopic(llm) {
    console.log(`${this.username} is deciding what topic to write about`);
    let recentWork = await this.#getRecentWork();
    console.log(`DEBUGGING recentWork: ${recentWork}`); // For debugging

    const recentWorkBlock =
      recentWork.length > 0
        ? `These are recent articles you've written: ${recentWork}`
        : "";

    // Prompt construction:

    let messages = [
      {
        role: "system",
        content: ` You're an author of a popular blog. ${this.bioBlock} ${recentWorkBlock}`,
      },
      {
        role: "user",
        content: `Given your author profile and recent works, choose a topic for your next blog post. The new post should be different from other things you've written, but still written in your voice. Create a brief outline of your next blog post.`,
      },
    ];

    // For debugging:
    // console.log(`Dedice Blog Topic messages: ${messages}`)

    try {
      const response = await super.promptLLM(messages, (llm = "chatgpt"));
      console.log(`${this.username} finished deciding blog topic.`);
      return response;
    } catch (error) {
      return new ExpressError(
        `${this.username} was unable to prompt LLM to decide on a topic.  ${error}`
      );
    }
  }

  // TODO: Write a social media post
  writeSocialPost() {
    // does something
  }
}
module.exports = AgentService;
