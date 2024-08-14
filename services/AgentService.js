// Define the ai agent class. Final naming tbd. Could be agent or author or something else. This is the new aiBlogger.js

const { ExpressError, NotFoundError } = require("../utilities/expressError");
const LLMService = require("../services/LLMService");
const htmlParser = require("../utilities/htmlParser");
const getUnsplashImage = require("../utilities/getUnsplashImage");
const PostService = require("../services/PostService");
const { ChatGPT, LLMs } = require("../utilities/Chat");
const { Agent, Blog } = require("../models");
const ActiveAgents = require("../models/ActiveAgents");

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

  // == INSTANCE PROPERTIES ==
  bioBlock = this.authorBio
    ? `\n This is your profile: ${this.authorBio.length}`
    : "";

  // === STATIC METHODS ===

  static async sayHello() {
    return await Agent.sayHello();
  }

  static async create({ accountId, body }) {
    console.log("service: creating a new agent");
    try {
      let newAgent = { ...body, accountId };
      return await Agent.create(newAgent);
    } catch (error) {
      throw error;
    }
  }

  static async findAll({ accountId }) {
    console.log(`service: finding all agents for accountId: ${accountId}`);
    try {
      let agents = await Agent.findAll({ where: { accountId } });
      return agents;
    } catch (error) {
      throw error;
    }
  }

  static async findOne({ agentId, accountId }) {
    console.log(
      `service: finding agent ${agentId} for accountId: ${accountId}`
    );
    try {
      let agent = await Agent.findOne({
        where: { agentId, accountId },
      });
      return agent;
    } catch (error) {
      throw error;
    }
  }

  static async update({ accountId, agentId, body }) {
    console.log(
      `service: updating agent ${agentId} for accountId: ${accountId}`
    );
    try {
      const agent = await Agent.findOne({ where: { agentId, accountId } });
      if (!agent) throw new NotFoundError("Agent not found.");

      await agent.update(body);
      await agent.save(); // trigger the beforeUpdate hook

      if (agent.isEnabled) {
        // triggers activation procedure
        await this.activate(agent);
      } else if (!agent.isEnabled) {
        // triggers deactivation procedure
        await this.deactivate(agent);
      }
      return agent;
    } catch (error) {
      throw error;
    }
  }

  static async activate(agent) {
    console.log(`activating ${agent.agentId}`);
    try {
      return ActiveAgents.add(agent); // add the agent to active class
    } catch (error) {
      throw new Error(error);
    }
  }

  static async deactivate({ agentId }) {
    console.log(`deactivating ${agentId}`);
    try {
      return ActiveAgents.remove(agentId); // remove the agent to active class
    } catch (error) {
      throw new Error(error);
    }
  }

  static async delete({ accountId, agentId }) {
    console.log(
      `service: deactivating and deleting agent ${agentId} for account: ${accountId}`
    );
    try {
      let result = await Agent.destroy({ where: { agentId, accountId } });
      if (result > 0) {
        await this.deactivate({ agentId }); // Deactivate
        return { message: "Delete successful" };
      } else {
        throw new NotFoundError(
          `Agent ${agentId} for account ${accountId} not found.`
        );
      }
    } catch (error) {
      throw error;
    }
  }

  /** WRITE BLOG POST
   * @topic An outline of the post to be written, which helps the AI write. Optional. If non is provided, the AI will run a utility function to choose a topic.
   * @param llm the name of the large language model to use. "chatgpt" | "claude"
   * @param maxWords The maximum wordcount in the returned blog post
   * @returns a blog in string formatted HTML
   */
  static async writePost({ agentId, options: providedOptions }) {
    console.log("Inside writePost");

    const defaultOptions = {
      llm: "chatgpt",
      maxWords: 1000,
      topic: null,
    };
    // overwrite default options with provided options if provided
    const options = { ...defaultOptions, ...providedOptions };
    console.log("Options:");
    console.dir(options);
    // return;

    // Look for agent in Map. Else look in DB. Else throw error
    const activeAgent = ActiveAgents.get(agentId);
    let agent = activeAgent
      ? activeAgent.agent
      : await Agent.findByPk(agentId, { include: Blog });
    // activeAgent
    // ? let agent = activeAgent.agent
    // : let a
    // let agent = activeAgent.agent ?? await Agent.findByPk(agentId);

    if (!agent) return new NotFoundError("Agent not found.");

    console.log(`${agent.username} started writing a blog post.
      Options: 
      llm: ${options.llm}
      maxWords: ${options.maxWords}
      topic: ${options.topic}`);
    console.log("Agent dir:");
    console.dir(agent);

    // If no topic is provided, decide one
    const topicBlock = options.topic ?? (await this.#decideBlogTopic({agent, llm:options.llm}));
    console.log(`Blog topic: ${topicBlock}`);

    // Instantiate a new Chat
    const chat = new LLMs[options.llm](agent); // does this work?
    // const chat = new ChatGPT(agent);
    // First instruction
    chat.addMessage(
      `user`,
      `Write a new blog post using the following outline and instructions.`
    );
    // Next instruction
    chat.addMessage(
      `user`,
      `OUTLINE:
        ${topicBlock}`
    );
    // Next instruction
    chat.addMessage(
      `user`,
      `INSTRUCTIONS:
        1. Expand upon the topic until you reach ${options.maxWords} words.
        2. Format the response in HTML with proper HTML tags.
        3. Include a title in <h1> tags.
        4. Wrap the rest of the post in a <div> tag with id="primary-content".
        5. But do not include any boilerplate HTML`
    );

    // Invoke llm
    console.log(`${agent.username} invoking LLM ${options.llm}.`);
    const response = await chat.sendPrompt();
    console.log(`${agent.username} invoked ${options.llm}.`);

    // Parse and format html resposne from llm
    let post = htmlParser(response); // TODO: update this parser function. It's more like a formatter.

    // Get a random image based on the post title
    const imageUrl = await getUnsplashImage(post.titlePlaintext);
    console.log("sourced image url: ", imageUrl);

    // Assemble the post for response
    const generatedPost = {
      ...post,
      imageUrl: String(imageUrl),
      agentId: agent.agentId,
    };
    console.log(`${agent.username}'s postData about to be saved to db:`);
    console.dir(generatedPost);

    return generatedPost; // return the generated, formatted post.
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
   * @returns string formatted list of recent titles
   */

  // GET RECENT WORK IS DEPRECATED
  // async #getRecentWork(agent) {
  //   const titles = await PostService.findRecentTitles({
  //     agentId: agent.agentId,
  //   });
  //   if (!titles) return `You haven't written anything yet.`;
  //   let recentWork = [
  //     `Here are the titles of some of your recent work:`,
  //     ...titles.slice(0, 9),
  //   ].join("\n - ");
  //   return recentWork;
  // }

  /** Asks LLM to decide on a new topic to write about, based on the author's bio and recent work.
   * @returns Topic.: An outline of the next article to write when calling writePost
   */
  static async #decideBlogTopic({agent, llm}) {
    console.log('inside decideBlogTopic')
    const { agentId } = agent;
    const titles = await PostService.findRecentTitles({
      agentId: agentId,
    });
    let recentWork = titles
      ? [
          `Here are the titles of some of your recent work:`,
          ...titles.slice(0, 9),
        ].join("\n - ")
      : `You havent written anything yet.`;
        console.log(`RECENT WORK ${recentWork}`)
    // const chat = new ChatGPT(agent);
    const chat = new LLMs[llm](agent); // does this work?
    chat.addMessage(`user`, recentWork);
    chat.addMessage(
      `user`,
      `Given your author bio and recent works, choose a topic for your next blog post. The new post should be different from other things you've written, but still adhere to your bio. For each section of the blog post, write a brief summary of the planned content.`
    );
    console.log(`MESSAGES: `)
    console.dir(chat.getMessages())

    try {
      const completion = await chat.sendPrompt(); // returns the completion response
      return completion 
    } catch (error) {
      throw new Error(error);
    }
  }

  // TODO: Write a social media post
  writeSocialPost() {
    // does something
  }
}
module.exports = AgentService;
