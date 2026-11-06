import { Op } from "sequelize";
import cron, { ScheduledTask } from "node-cron";
import models from "../models";
import { writePost } from "../agents/writePost";
import { hasApiKey } from "../agents/model";
import PostService from "./PostService";

const { Agent } = models;

// Holds active agent cron tasks
const ACTIVE_AGENTS = new Map<string, { blogTask?: ScheduledTask }>();

/** Runs agents on their schedules. Agents that are turned on get a cron task that writes and saves a post. */
class AgentScheduler {
  /** Upon server start, schedules a task for every enabled agent */
  static async loadActive() {
    console.log("LOADING ACTIVE AGENTS...");
    const agents = await Agent.findAll({
      where: {
        [Op.or]: [{ postSettings: { isEnabled: true } }, { socialSettings: { isEnabled: true } }],
      },
    });
    for (const agent of agents) {
      if (agent.postSettings.isEnabled) {
        this.setBlogTask(agent);
        // Agents can't borrow the server's keys, so one with no key of its own fails every scheduled run. Say so at startup.
        if (!hasApiKey(agent)) {
          console.warn(`WARNING: ${agent.username} (${agent.agentId}) is scheduled to post but has no API key, so every scheduled run will fail until one is added.`);
        }
      }
      if (agent.socialSettings.isEnabled) this.setSocialTask(agent);
      console.log(`LOADED ACTIVE AGENT: ${agent.username}`);
    }
    console.log(`Loaded ${ACTIVE_AGENTS.size} active agents`);
  }

  /** Replaces the agent's blog task to match its current postSettings. Call it whenever they change. */
  static setBlogTask(agent) {
    console.log(`${agent.username} setting Blog Task`);
    const { agentId, postSettings } = agent;
    const { cronSchedule, timezone } = postSettings;

    // Stop the current task if there is one
    const tasks = ACTIVE_AGENTS.get(agentId);
    if (tasks?.blogTask) {
      tasks.blogTask.stop();
      console.log("task stopped");
      ACTIVE_AGENTS.delete(agentId);
    }

    if (!postSettings.isEnabled) return;

    const blogTask = cron.schedule(
      cronSchedule,
      async () => {
        console.log("Initiated scheduled blog task");
        // Nothing awaits this callback, so an uncaught error would crash the server
        try {
          const generatedPost = await writePost({ agentId });
          await PostService.create(generatedPost);
          console.log("Completed scheduled blog task");
        } catch (error) {
          console.error(`Scheduled post failed for ${agent.username} (${agentId}):`, error);
        }
      },
      { timezone, name: agentId }
    );
    ACTIVE_AGENTS.set(agentId, { blogTask });
    console.log(`Added ${agentId} to ACTIVE_AGENTS. Number of actives: ${ACTIVE_AGENTS.size}`);
  }

  // Automated social is not meant to be accessed yet.
  static setSocialTask(agent) {
    // does nothing for now
  }

  /** Stops everything scheduled for this agent */
  static deactivate(agentId: string) {
    console.log(`deactivating ${agentId}`);
    ACTIVE_AGENTS.get(agentId)?.blogTask?.stop();
    ACTIVE_AGENTS.delete(agentId);
  }
}

export default AgentScheduler;
