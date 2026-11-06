// Creates, reads, updates and deletes agents, and keeps their schedules in step.
// What an agent does lives in src/agents (writePost, replyToComment); when it does it, in AgentScheduler.
import { isDeepStrictEqual } from "util";
import models from "../models";
import { BadRequestError, NotFoundError } from "../utilities/expressError";
import validatePostSettings from "../utilities/validatePostSettings";
import cronEncoder from "../utilities/cronEncoder";
import AgentScheduler from "./AgentScheduler";

const { Agent, Post } = models;

class AgentService {
  static async create({ accountId, body }) {
    console.log(`AgentService: CREATE agent for accountId: ${accountId}`);

    if (!validatePostSettings(body.postSettings)) throw new BadRequestError("Invalid post settings");
    const cronSchedule = cronEncoder({
      time: body.postSettings.time,
      daysOfWeek: body.postSettings.daysOfWeek,
    });
    // The ids are always generated here, never taken from the caller
    const { agentId: _agentId, accountId: _accountId, ...fields } = body;
    const newAgent = { ...fields, accountId, postSettings: { ...fields.postSettings, cronSchedule } };
    const createdAgent = await Agent.create(newAgent);
    if (createdAgent.postSettings.isEnabled) AgentScheduler.setBlogTask(createdAgent);
    return createdAgent;
  }

  static async findAll({ accountId }) {
    console.log(`AgentService: FINDALL agents for accountId: ${accountId}`);
    return Agent.findAll({
      where: { accountId },
      include: [{ model: Post, attributes: ["postId", "title"] }],
    });
  }

  static async findOneByPostId({ postId }) {
    console.log(`Finding an agent by ${postId}`);
    const agent = await Agent.findOne({
      include: [{ model: Post, attributes: ["postId"], where: { postId } }],
    });
    if (!agent) throw new NotFoundError();
    return agent;
  }

  static async findOne({ agentId, accountId }) {
    console.log(`AgentService: FINDONE agent ${agentId} for accountId: ${accountId}`);
    return Agent.findOne({
      where: { agentId, accountId },
      include: [{ model: Post, attributes: ["postId", "title"] }],
    });
  }

  static async update({ accountId, agentId, body }) {
    console.log(`AgentService: UPDATE agent ${agentId} for accountId: ${accountId}`);
    const agent = await Agent.findOne({ where: { agentId, accountId } });
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

    if (!isDeepStrictEqual(oldPostSettings, agent.postSettings)) AgentScheduler.setBlogTask(agent);
    if (!isDeepStrictEqual(oldSocialSettings, agent.socialSettings)) AgentScheduler.setSocialTask(agent);
    return agent;
  }

  static async delete({ accountId, agentId }) {
    console.log(`AgentService: deactivating and deleting agent ${agentId} for account: ${accountId}`);
    const result = await Agent.destroy({ where: { agentId, accountId } });
    if (result === 0) throw new NotFoundError(`Agent ${agentId} for account ${accountId} not found.`);
    AgentScheduler.deactivate(agentId);
    return { message: "Delete successful" };
  }

  // TODO: Write a social media post
  static async writeSocial() {
    // do something
  }
}

export default AgentService;
