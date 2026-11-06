// Define the ai agent class. Final naming tbd. Could be agent or author or something else. This is the new aiBlogger.js
import { Op } from "sequelize";
import cron, { ScheduledTask } from "node-cron";
import models from "../models";
import { isDeepStrictEqual } from "util";
import { BadRequestError, ExpressError, NotFoundError } from "../utilities/expressError";
import validatePostSettings from "../utilities/validatePostSettings";
import getUnsplashImage from "../utilities/getUnsplashImage";
import cronEncoder from "../utilities/cronEncoder";
import { createChat } from "../utilities/Chat";
import { cleanText } from "../utilities/sanitizePrompt";
import PostService from "./PostService";
import CommentService from "./CommentService";
import StatusService from "./StatusService";

const { Agent, Post } = models;

// A reply that arrives instantly feels robotic, so the author "reads" the comment first
const MIN_REPLY_DELAY_MS = 3000;
const MAX_REPLY_DELAY_MS = 12000;
const randomReplyDelay = () =>
  MIN_REPLY_DELAY_MS + Math.random() * (MAX_REPLY_DELAY_MS - MIN_REPLY_DELAY_MS);

// Holds active agent cron tasks
const ACTIVE_AGENTS = new Map<string, { blogTask?: ScheduledTask }>();

class AgentService {
  constructor() {}

  // === STATIC METHODS ===

  static async loadActive() {
    console.log("LOADING ACTIVE AGENTS...");
    console.log("imported Agent model:", Agent);
    console.log("imported Post model:", Post);

    const agents = await Agent.findAll({
      where: {
        [Op.or]: [
          { postSettings: { isEnabled: true } },
          { socialSettings: { isEnabled: true } },
        ],
      },
    });
    for (const agent of agents) {
      if (agent.postSettings.isEnabled) this.#setBlogTask(agent);
      if (agent.socialSettings.isEnabled) this.#setSocialTask(agent);
      console.log(`LOADED ACTIVE AGENT: ${agent.username}`);
    }
    console.log("Initially loaded ACTIVE AGENTS:");
    ACTIVE_AGENTS.forEach((tasks) => {
      console.dir(tasks?.blogTask?.name);
    });

    console.dir(ACTIVE_AGENTS);
  }


  static async create({ accountId, body }) {
    console.log(
      `AgentService: CREATE agent for accountId: ${accountId} with body ${body}`
    );

    try {
      if (!validatePostSettings(body.postSettings)) throw new BadRequestError("Invalid post settings");
      const cronSchedule = cronEncoder({
        time: body.postSettings.time,
        daysOfWeek: body.postSettings.daysOfWeek,
      });
      // The ids are always generated here, never taken from the caller
      const { agentId: _agentId, accountId: _accountId, ...fields } = body;
      const newAgent = { ...fields, accountId, postSettings: { ...fields.postSettings, cronSchedule } };
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
      const agents = await Agent.findAll({
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
      const agent = await Agent.findOne({
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

      // An agent can't be handed to another account or renamed by id
      const { accountId: _accountId, agentId: _agentId, ...changes } = body;

      // New post settings need a fresh schedule. Updates that don't touch them skip this.
      if (changes.postSettings) {
        if (!validatePostSettings(changes.postSettings)) throw new BadRequestError("Invalid post settings");
        changes.postSettings = {
          ...changes.postSettings,
          cronSchedule: cronEncoder({
            time: changes.postSettings.time,
            daysOfWeek: changes.postSettings.daysOfWeek,
          }),
        };
      }
      await agent.update(changes); // triggers the beforeUpdate hook

      const newPostSettings = agent.postSettings;
      const newSocialSettings = agent.socialSettings;

      // If post settings have changed, update task
      if (!isDeepStrictEqual(oldPostSettings, newPostSettings)) {
        // update blog task
        this.#setBlogTask(agent);
      }
      // If social settings have changed, update task
      if (!isDeepStrictEqual(oldSocialSettings, newSocialSettings)) {
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
      const result = await Agent.destroy({ where: { agentId, accountId } });
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
    
  }

  /** Writes a reply (plain text) to a reader's comment on one of the agent's posts. */
  static async generateComment({ agent, comment, post }) {
    const maxWords = agent.commentSettings?.maxWords ?? 100;
    const chat = createChat(agent);

    // Everything a reader typed is fenced in tags and cleaned; the system prompt says to treat it as data
    const title = cleanText(post.title, { maxLength: 200 });
    const postText = cleanText(post.content, { maxLength: 8000 });
    const author = cleanText(comment.authorName, { maxLength: 50 });
    const commentText = cleanText(comment.content, { maxLength: 1000 });

    chat.addMessage(
      "user",
      `A reader commented on one of your blog posts. Write a short, thoughtful reply of at most ${maxWords} words, in your own voice and in the first person. Engage with what they actually said. Use plain text with no title or headings, and address them by name only if it feels natural.

<post>
Title: ${title}

${postText}
</post>

<comment author="${author}">
${commentText}
</comment>`
    );

    const reply = await chat.sendPrompt({ schema: false });
    return String(reply).trim().replace(/^["“]|["”]$/g, "");
  }

  /** Runs after the comment response is sent: writes the reply, saves it, and records the outcome on the status. */
  static async replyToComment({ agent, comment, status }) {
    try {
      await StatusService.updateInstance(status, { status: "in_progress" });
      await new Promise((resolve) => setTimeout(resolve, randomReplyDelay()));
      const post = await Post.findByPk(comment.postId);
      const content = await this.generateComment({ agent, comment, post });
      const reply = await CommentService.create({
        accountId: comment.accountId,
        postId: comment.postId,
        parentId: comment.commentId,
        authorName: cleanText(agent.firstName, { maxLength: 50 }),
        agentId: agent.agentId,
        content,
      });
      await StatusService.updateInstance(status, {
        status: "success",
        result: { commentId: reply.commentId },
      });
    } catch (error) {
      console.error(`${agent.username} couldn't reply to comment ${comment.commentId}:`, error);
      await StatusService.updateInstance(status, {
        status: "error",
        result: { message: error.message },
      }).catch(() => {});
    }
  }

  /** WRITE BLOG POST
   * @topic An outline of the post to be written, which helps the AI write. Optional. If non is provided, the AI will run a utility function to choose a topic.
   * @param maxWords The maximum wordcount in the returned blog post
   * @returns a blog in string formatted HTML
   */
  static async writePost({ agentId, accountId, options, status }: { agentId: string; accountId?: string; options?: { maxWords?: number; topic?: string | null }; status?: any }) {
    console.log(`${agentId} is starting writePost`);
    // update the status to in progress
    if (status) {
      StatusService.updateInstance(status, { status: "in_progress" });
    }

    // agentId, options: providedOptions

    const defaultOptions = {
      maxWords: 1000,
      topic: null,
    };
    // overwrite default options with provided options if provided
    options = { ...defaultOptions, ...options };

    // These come from the API caller and go into the prompt, so check them first
    const maxWords = Number(options.maxWords);
    if (!Number.isInteger(maxWords) || maxWords < 1 || maxWords > 10000) {
      throw new BadRequestError("maxWords must be a whole number between 1 and 10000.");
    }
    options.maxWords = maxWords;
    options.topic = cleanText(options.topic, { maxLength: 2000 }) || null;
    console.log("Options:");
    console.dir(options);

    // Get Agent from DB

    // When an accountId is given, the agent must belong to it. Scheduled posts skip this check.
    const agent = await Agent.findOne({ where: { agentId, ...(accountId && { accountId }) } });
    if (!agent) throw new NotFoundError("Agent not found.");

    console.log(`${agent.username} started writing a blog post.
      Options: 
      model: ${agent.llm?.model}
      maxWords: ${options.maxWords}
      topic: ${options.topic}`);

    // If no topic is provided, decide one

    console.log(`${agent.username} is about to create a topic`);
    const topicBlock =
      options.topic ??
      (await this.#decideBlogTopic({ agent }));
    console.log(`${agent.username}'s Blog topic: ${topicBlock}`);
    console.dir(topicBlock);

    // Instantiate a new Chat
    const chat = createChat(agent);
    // First instruction
    chat.addMessage(
      "user",
      "Write a new article using the following outline and instructions."
    );
    // Next instruction
    chat.addMessage(
      "user",
      `OUTLINE:
        ${topicBlock}`
    );
    // Next instruction
    chat.addMessage(
      "user",
      `INSTRUCTIONS:
        1. Expand upon the topic until you reach ${options.maxWords} words.
        2. Format your response according to the supplied JSON schema.
        3. In the "content": field, be sure to write in markdown to make rendering easier later.`
    );

    // Invoke llm
    console.log(`${agent.username} invoking ${agent.llm?.model}.`);
    const response = await chat.sendPrompt();
    console.log(`${agent.username} received response from ${agent.llm?.model}.`);

    // The model's JSON is not guaranteed to have what we asked for
    if (typeof response?.title !== "string" || !response.title.trim() || typeof response?.content !== "string" || !response.content.trim()) {
      throw new ExpressError("The AI returned an incomplete post. Please try again.", 502);
    }

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
      imageUrl: imageUrl || null, // no image (e.g. Unsplash unavailable) is fine
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
  static async #decideBlogTopic({ agent }) {
    console.log("entered #decideBlogTopic for agent:", agent.agentId);
    const { agentId } = agent;
    const titles = await PostService.findRecentTitles({
      agentId: agentId,
    });
    const recentWork =
      titles.length > 0 ? [
        "Here are the titles of some of your recent work:",
        ...titles.slice(0, 9),
      ].join("\n - ") : "You havent written anything yet.";
    console.log("resolved recentWork:", recentWork);
    const chat = createChat(agent); // Get the appropriate Chat LLM
    console.log("created chat: ", chat);
    chat.addMessage("user", recentWork);
    chat.addMessage(
      "user",
      "Given your author bio and recent works, choose a topic for your next blog post. The new post should be different from other things you've written, but still adhere to your bio. For each section of the blog post, write a brief summary of the planned content."
    );
    console.log("MESSAGES: ");
    console.dir(chat.getMessages());

    // The topic is a plain-text outline, not a post, so skip the post JSON schema
    return await chat.sendPrompt({ schema: false });
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
        // if no more tasks, remove agent from ACTIVE entirely
        if (Object.keys(tasks).length === 0) ACTIVE_AGENTS.delete(agentId);
      }

      if (postSettings.isEnabled == false) {
        // Return without creating task
        
      } else {
        // create and set the task
        // create the cron
        const blogTask = cron.schedule(
          cronSchedule,
          async () => {
            console.log("Initiated scheduled blog task");
            // Nothing awaits this callback, so an uncaught error would crash the server
            try {
              const generatedPost = await AgentService.writePost({
                agentId: agent.agentId,
              });
              await PostService.create(generatedPost);
              console.log("Completed scheduled blog task");
            } catch (error) {
              console.error(`Scheduled post failed for ${agent.agentId}:`, error);
            }
          },
          { timezone, name: agentId }
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
    // does nothing for now
  }

  static async #deactivateAgent({ agentId }) {
    console.log(`deactivating ${agentId}`);
    try {
      ACTIVE_AGENTS.get(agentId)?.blogTask?.stop();
      ACTIVE_AGENTS.delete(agentId);
      console.log(`deacivated ${agentId}`);
      
    } catch (error) {
      throw new Error(error);
    }
  }
}

// NEED TO MOVE THIS FUNCTION UNTIL AFTER DB IS DONE LOADING
// AgentService.loadActive(); // Upon server start, schedule all active agent tasks

export default AgentService;
