// Define the ai agent class. Final naming tbd. Could be agent or author or something else. This is the new aiBlogger.js
console.log("AGENT SERVICE");
const { ExpressError, NotFoundError } = require("../utilities/expressError");
const htmlParser = require("../utilities/htmlParser");
const getUnsplashImage = require("../utilities/getUnsplashImage");
const PostService = require("../services/PostService");
const { LLMs } = require("../utilities/Chat");
const { Agent, Blog, Post } = require("../models");
const { Op } = require("sequelize");

const StatusService = require("./StatusService");
const cron = require("node-cron");

// Holds active agent cron tasks
const ACTIVE_AGENTS = new Map();

class ActiveAgent {
  constructor(agent) {
    this.agent = agent;
    this.agentId = agent.agentId; // I think this is redundant with the line above
    this.blogTask = null;
    this.socialTask = null; // TODO: nodecron task
  }
}

class AgentService {
  constructor() {}

  // === STATIC METHODS ===

  static async loadActive() {
    console.log(`LOADING ACTIVE AGENTS...`);
    const agents = await Agent.findAll({
      where: {
        [Op.or]: [
          { postSettings: { isEnabled: true } },
          { socialSettings: { isEnabled: true } },
        ],
      },
    });
    for (let agent of agents) {
      if (agent.postSettings.isEnabled) this.#setBlogTask(agent);
      if (agent.socialSettings.isEnabled) this.#setSocialTask(agent);
      console.log(`LOADED ACTIVE AGENT: ${agent.username}`);
    }
    console.log(`Initially loaded ACTIVE AGENTS:`);
    ACTIVE_AGENTS.forEach((tasks) => {
      console.dir(tasks.blogTask.options.name);
      console.log(tasks?.blogTask?._scheduler.timeMatcher);
    });

    console.dir(ACTIVE_AGENTS);
  }

  static sayHello() {
    return Agent.sayHello();
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
      let agents = await Agent.findAll({
        where: { accountId },
        include: [{ model: Post, attributes: ["postId", "titlePlaintext"] }],
      });
      return agents;
    } catch (error) {
      throw error;
    }
  }

  static async findOneByPostId({ postId }) {
    console.log(`Finding an agent by ${postId}`);
    try {
      const agent = await Agent.findOne({
        include: [
          { model: Post, attributes: ["postId"], where: { postId: postId } },
          { model: Blog },
        ],
      });
      if (!agent) throw new NotFoundError();
      return agent;
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
        include: [{ model: Post, attributes: ["postId", "titlePlaintext"] }],
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
      const agent = await Agent.findOne({
        where: { agentId, accountId },
        include: Blog,
      });
      if (!agent) throw new NotFoundError("Agent not found.");

      const oldPostSettings = agent.postSettings;
      const oldSocialSettings = agent.socialSettings;

      console.log("Attempting update with body: ", body);
      await agent.update(body);
      await agent.save(); // trigger the beforeUpdate hook

      const newPostSettings = agent.postSettings;
      const newSocialSettings = agent.socialSettings;

      // If post settings have changed, update task
      if (JSON.stringify(oldPostSettings) !== JSON.stringify(newPostSettings)) {
        // update blog task
        this.#setBlogTask(agent);
      }
      // If social settings have changed, update task
      if (
        JSON.stringify(oldSocialSettings) !== JSON.stringify(newSocialSettings)
      ) {
        // update social task
        this.#setSocialTask(agent);
      }
      return agent;
    } catch (error) {
      throw error;
    }
  }

  static async delete({ accountId, agentId }) {
    console.log(
      `service: deactivating and deleting agent ${agentId} for account: ${accountId}`
    );
    try {
      let result = await Agent.destroy({ where: { agentId, accountId } });
      if (result > 0) {
        await this.#deactivateAgent({ agentId }); // Deactivate
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

  // TODO: Write a social media post
  static async writeSocial() {
    // do something
    return;
  }

  static async generateComment({ agent, comment }) {
    console.log(`Inside AgentService generateComment`);
    // accept a newly created comment (id, ) and an agent

    const defaultOptions = {
      llm: "chatgpt",
      maxWords: 200,
    };
    const { username, firstName, lastName } = comment.User;
    let options = { ...defaultOptions, ...agent.commentSettings };
    console.log(`comment options ${{ ...options }}`);

    // instantiate a chat
    const chat = new LLMs[options.llm](agent);

    chat.addMessage(
      `user`,
      `A user has commented on one of your articles. Write a thoughtful response in ${options.maxWords} words or less using the following information as context.`
    );
    // Next instruction
    chat.addMessage(
      `user`,
      `- The user's comment: ${comment.content} \n
       - The user's info: ${{ ...comment.User }} \n
       
       Your original article text: \n
       "${comment.Post.titlePlaintext}"\n\n
       "${comment.Post.bodyPlaintext}"
       `
    );
    const completion = await chat.sendPrompt();
    console.log(completion);
    return completion;
  }

  /** WRITE BLOG POST
   * @topic An outline of the post to be written, which helps the AI write. Optional. If non is provided, the AI will run a utility function to choose a topic.
   * @param llm the name of the large language model to use. "chatgpt" | "claude"
   * @param maxWords The maximum wordcount in the returned blog post
   * @returns a blog in string formatted HTML
   */
  static async writePost({ agentId, options, status }) {
    console.log("Inside writePost");
    // update the status to in progress
    if (status) {
      StatusService.updateInstance(status, { status: "in_progress" });
    }

    // agentId, options: providedOptions

    const defaultOptions = {
      llm: "chatgpt",
      maxWords: 1000,
      topic: null,
    };
    // overwrite default options with provided options if provided
    options = { ...defaultOptions, ...options };
    console.log("Options:");
    console.dir(options);

    // Get Agent from DB

    const agent = await Agent.findByPk(agentId, { include: Blog });
    // console.log("Agent being used: ", agent);
    if (!agent) return new NotFoundError("Agent not found.");

    console.log(`${agent.username} started writing a blog post.
      Options: 
      llm: ${options.llm}
      maxWords: ${options.maxWords}
      topic: ${options.topic}`);

    // If no topic is provided, decide one

    const topicBlock =
      options.topic ??
      (await this.#decideBlogTopic({ agent, llm: options.llm }));
    // console.log(`Blog topic: ${topicBlock}`);

    // Instantiate a new Chat
    const chat = new LLMs[options.llm](agent);
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
    let post = htmlParser(response); // TODO: update this parser function. It's more like a formatter. Possibly ask the LLM to return in JSON instead.

    // Get a random image based on the post title
    let imageUrl = "";
    await getUnsplashImage(post.titlePlaintext).then(
      (val) => {
        imageUrl = val;
      },
      (err) => {
        console.log("Error fetching image:", err);
      }
    );

    // Assemble the post for response
    const generatedPost = {
      ...post,
      imageUrl: String(imageUrl),
      agentId: agent.agentId,
      authorId: agent.agentId,
      blogId: agent.blogId,
      accountId: agent.accountId
    };
    // console.dir(generatedPost);
    console.log(`${agent.username} generated a new post.`);

    return generatedPost; // return the generated, formatted post.
  }

  // ===PRIVATE HELPER METHODS===

  /** Asks LLM to decide on a new topic to write about, based on the author's bio and recent work.
   * @returns Topic.: An outline of the next article to write when calling writePost
   */
  static async #decideBlogTopic({ agent, llm }) {
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

    const chat = new LLMs[llm](agent); // Get the appropriate Chat LLM
    chat.addMessage(`user`, recentWork);
    chat.addMessage(
      `user`,
      `Given your author bio and recent works, choose a topic for your next blog post. The new post should be different from other things you've written, but still adhere to your bio. For each section of the blog post, write a brief summary of the planned content.`
    );
    // console.log(`MESSAGES: `);
    // console.dir(chat.getMessages());

    try {
      const completion = await chat.sendPrompt(); // returns the completion response
      return completion;
    } catch (error) {
      throw new Error(error);
    }
  }

  static async #setBlogTask(agent) {
    console.log(`${agent.username} setting Blog Task`);
    try {
      const { agentId, postSettings } = agent;
      const { cronSchedule, timezone } = postSettings;
      const tasks = ACTIVE_AGENTS.get(agentId);

      if (!agent.postSettings.isEnabled && !tasks.blogTask) {
        return; // nothing needs changing
      }
      // Turn off current blogTask
      if (!agent.postSettings.isEnabled && tasks.blogTask) {
        tasks.blogTask.stop(); // stop cron
        console.log("task stopped");
        delete tasks.blogTask;
        if (tasks == {}) ACTIVE_AGENTS.delete(agentId);
        else ACTIVE_AGENTS.set(agentId, tasks);
      }

      // create the cron
      const blogTask = cron.schedule(
        cronSchedule,
        async () => {
          console.log("task: before gen");
          const generatedPost = await AgentService.writePost({
            agentId: agent.agentId,
          });
          console.log("task: after gen");
          await PostService.create(generatedPost);
          console.log("task: exiting task");
        },
        { scheduled: true, timezone, name: agentId }
      );
      // store task to actives
      ACTIVE_AGENTS.set(agentId, { ...tasks, blogTask });
    } catch (error) {
      throw new Error(error.message);
    }
  }
  // Automated social is not meant to be accessed yet.
  static async #setSocialTask(agent) {
    return; // does nothing for now
    console.log(`${agent.username} setting Social Task`);
    try {
      const { agentId, socialSettings } = agent;
      const { cronSchedule, timezone } = postSettings;
      const activeAgent = ACTIVE_AGENTS.get(agentId) || {}; // Retrieve current agent or instantiate empty object

      const task = cron.schedule(
        cronSchedule,
        // TODO: create a function to auto social
        console.log("placeholder for autosocial")
      );
      // create a new ActiveAgent to replace the current one
      const updatedAgent = new ActiveAgent(activeAgent);
      updatedAgent.agent = agent;
      updatedAgent.socialTask = task;

      ACTIVE_AGENTS.set(agentId, updatedAgent);
      console.log("CURRENT ACTIVE AGENTS:");
      console.dir(ACTIVE_AGENTS);
    } catch (error) {
      throw new Error(error);
    }
  }

  static async #stopBlogTask({ agentId }) {
    const activeAgent = ACTIVE_AGENTS.get(agentId);
    if (!activeAgent) return; // Nothing to deactivate
    if (activeAgent.blogTask) {
      activeAgent.blogTask.stop(); // stop the task
      const updatedAgent = new ActiveAgent(activeAgent); // creates a new AA to replace
      updatedAgent.blogTask = null;

      ACTIVE_AGENTS.set(agentId, updatedAgent);
      console.log("blogTask stopped");
      return;
    }
    console.log("no active blog task to stop");
    return;
  }

  static async #stopSocialTask({ agentId }) {
    return; // does nothing for now
    const activeAgent = ACTIVE_AGENTS.get(agentId);
    if (!activeAgent) return; // Nothing to deactivate
    if (activeAgent.socialTask) {
      activeAgent.socialTask.stop(); // stop the task
      const updatedAgent = new ActiveAgent(activeAgent); // creates a new AA to replace
      updatedAgent.socialTask = null;

      ACTIVE_AGENTS.set(agentId, updatedAgent);
      console.log("socialTask stopped");
      return;
    }
    console.log("no active social task to stop");
    return;
  }

  static async #deactivateAgent({ agentId }) {
    console.log(`deactivating ${agentId}`);
    try {
      const activeAgent = ACTIVE_AGENTS.get(agentId);
      if (!activeAgent) return; // Nothing to deactivate
      // stop any running task
      if (activeAgent.blogTask) activeAgent.blogTask.stop();
      if (activeAgent.socialTask) activeAgent.socialTask.stop();
      ACTIVE_AGENTS.delete(agentId); // remove the agent to active class
    } catch (error) {
      throw new Error(error);
    }
  }
}

// NEED TO MOVE THIS FUNCTION UNTIL AFTER DB IS DONE LOADING
AgentService.loadActive(); // Upon server start, schedule all active agent tasks

module.exports = AgentService;
