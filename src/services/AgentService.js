// Define the ai agent class. Final naming tbd. Could be agent or author or something else. This is the new aiBlogger.js
console.log("AGENT SERVICE");
const { ExpressError, NotFoundError } = require("../utilities/expressError");

const getUnsplashImage = require("../utilities/getUnsplashImage");
import cronEncoder from "../utilities/cronEncoder";
import PostService from "../services/PostService";
const { LLMs } = require("../utilities/Chat");
const { Agent, Post } = require( "../models")
const { Op } = require("sequelize");

const StatusService = require("./StatusService");
const cron = require("node-cron");

// Holds active agent cron tasks
const ACTIVE_AGENTS = new Map();

class AgentService {
  constructor() {}

  // === STATIC METHODS ===

  static async loadActive() {
    console.log(`LOADING ACTIVE AGENTS...`);
    console.log(`imported Agent model:`, Agent);
    console.log(`imported Post model:`, Post);

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


  static async create({ accountId, body }) {
    console.log(
      `AgentService: CREATE agent for accountId: ${accountId} with body ${body}`
    );

    try {
      let cronSchedule = cronEncoder({
        time: body.postSettings.time,
        daysOfWeek: body.postSettings.daysOfWeek,
      });
      let newAgent = { ...body, accountId };
      newAgent.postSettings.cronSchedule = cronSchedule;
      console.log("CREATING AGENT:");
      console.dir(newAgent);
      const createdAgent = await Agent.create(newAgent);
      if (createdAgent.postSettings.isEnabled) this.#setBlogTask(createdAgent); // if enabled, set the task

      console.log("CREATED AGENT POST SETTINGS:");
      console.dir(createdAgent.postSettings);
      return createdAgent;
    } catch (error) {
      throw error;
    }
  }

  static async findAll({ accountId }) {
    console.log(`AgentService: FINDALL agents for accountId: ${accountId}`);
    try {
      let agents = await Agent.findAll({
        where: { accountId },
        include: [{ model: Post, attributes: ["postId", "title"] }],
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
      `AgentService: FINDONE agent ${agentId} for accountId: ${accountId}`
    );
    try {
      let agent = await Agent.findOne({
        where: { agentId, accountId },
        include: [{ model: Post, attributes: ["postId", "title"] }],
      });
      return agent;
    } catch (error) {
      throw error;
    }
  }

  static async update({ accountId, agentId, body }) {
    console.log(
      `AgentService: UPDATE agent ${agentId} for accountId: ${accountId} with body ${body}`
    );
    try {
      const agent = await Agent.findOne({
        where: { agentId, accountId },
      });
      if (!agent) throw new NotFoundError("Agent not found.");

      const oldPostSettings = agent.postSettings;
      const oldSocialSettings = agent.socialSettings;

      let cronSchedule = cronEncoder({
        time: body.postSettings.time,
        daysOfWeek: body.postSettings.daysOfWeek,
      });

      body.postSettings.cronSchedule = cronSchedule;
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
       "${comment.Post.title}"\n\n
       "${comment.Post.content}"
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
    console.log(`${agentId} is starting writePost`);
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

    const agent = await Agent.findByPk(agentId);
    // console.log("Agent being used: ", agent);
    if (!agent) return new NotFoundError("Agent not found.");

    console.log(`${agent.username} started writing a blog post.
      Options: 
      llm: ${options.llm}
      maxWords: ${options.maxWords}
      topic: ${options.topic}`);

    // If no topic is provided, decide one

    console.log(`${agent.username} is about to create a topic`);
    const topicBlock =
      options.topic ??
      (await this.#decideBlogTopic({ agent, llm: options.llm }));
    console.log(`${agent.username}'s Blog topic: ${topicBlock}`);
    console.dir(topicBlock);

    // Instantiate a new Chat
    const chat = new LLMs[options.llm](agent);
    // First instruction
    chat.addMessage(
      `user`,
      `Write a new article using the following outline and instructions.`
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
        2. Format your response according to the supplied JSON schema.
        3. In the "content": field, be sure to write in markdown to make rendering easier later.`
    );

    // Invoke llm
    console.log(`${agent.username} invoking LLM ${options.llm}.`);
    const response = await chat.sendPrompt();
    console.log(`${agent.username} received response from ${options.llm}.`);

    // Parse and format html resposne from llm

    // Get a random image based on the post title
    let imageUrl = "";
    await getUnsplashImage(response.title).then(
      (val) => {
        imageUrl = val;
      },
      (err) => {
        console.log("Error fetching image:", err);
      }
    );

    // Assemble the post for response
    const generatedPost = {
      title: response.title,
      content: response.content,
      imageUrl: String(imageUrl),
      agentId: agent.agentId,
      authorId: agent.agentId,
      accountId: agent.accountId,
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
    console.log("entered #decideBlogTopic. agent, llm:", agent, llm);
    const { agentId } = agent;
    const titles = await PostService.findRecentTitles({
      agentId: agentId,
    });
    let recentWork =
      titles.length > 0
        ? [
            `Here are the titles of some of your recent work:`,
            ...titles.slice(0, 9),
          ].join("\n - ")
        : `You havent written anything yet.`;
    console.log("resolved recentWork:", recentWork);
    const chat = new LLMs[llm](agent); // Get the appropriate Chat LLM
    console.log("created chat: ", chat);
    chat.addMessage(`user`, recentWork);
    chat.addMessage(
      `user`,
      `Given your author bio and recent works, choose a topic for your next blog post. The new post should be different from other things you've written, but still adhere to your bio. For each section of the blog post, write a brief summary of the planned content.`
    );
    console.log(`MESSAGES: `);
    console.dir(chat.getMessages());

    try {
      const completion = await chat.sendPrompt(); // returns the completion response
      return completion;
    } catch (error) {
      throw new Error(error);
    }
  }

  /**
   * This function gets invoked when agent.postSettings have changed for any reason.
   *
   */
  static async #setBlogTask(agent) {
    console.log(`${agent.username} setting Blog Task`);
    try {
      const { agentId, postSettings } = agent;
      const { cronSchedule, timezone } = postSettings;

      // Get, stop, and delete current task if it exists
      let tasks = ACTIVE_AGENTS.get(agentId);
      if (tasks && tasks.blogTask) {
        tasks.blogTask.stop();
        console.log("task stopped");
        delete tasks.blogTask;
        if (tasks == {}) ACTIVE_AGENTS.delete(agentId);
        // if no more tasks, remove agent from ACTIVE entirely
        else ACTIVE_AGENTS.set(agentId, tasks);
      }

      if (postSettings.isEnabled == false) {
        // Return without creating task
        return;
      } else {
        // create and set the task
        // create the cron
        const blogTask = cron.schedule(
          cronSchedule,
          async () => {
            console.log("Initiated scheduled blog task");
            const generatedPost = await AgentService.writePost({
              agentId: agent.agentId,
            });
            
            await PostService.create(generatedPost);
            console.log("Completed scheduled blog task");
          },
          { scheduled: true, timezone, name: agentId }
        );
        // store task to actives
        tasks ? tasks.blogTask = blogTask : tasks = { blogTask }; // handles if tasks is undefined
        ACTIVE_AGENTS.set(agentId,tasks);
        console.log(
          `Added ${agentId} and task ${blogTask} to ACTIVE_AGENTS. Number of actives: ${ACTIVE_AGENTS.size}`
        );
      }

    } catch (error) {
      throw new Error(error.message);
    }
  }
  // Automated social is not meant to be accessed yet.
  static async #setSocialTask(agent) {
    return; // does nothing for now
  }

  static async #deactivateAgent({ agentId }) {
    console.log(`deactivating ${agentId}`);
    try {
      const tasks = ACTIVE_AGENTS.get(agentId);
      tasks.forEach((task) => task.stop());
      ACTIVE_AGENTS.delete(agentId);
      console.log(`deacivated ${agentId}`);
      return;
    } catch (error) {
      throw new Error(error);
    }
  }
}

// NEED TO MOVE THIS FUNCTION UNTIL AFTER DB IS DONE LOADING
// AgentService.loadActive(); // Upon server start, schedule all active agent tasks

module.exports = AgentService;
