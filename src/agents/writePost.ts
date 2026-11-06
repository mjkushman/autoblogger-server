import models from "../models";
import { BadRequestError, NotFoundError } from "../utilities/expressError";
import { cleanText } from "../utilities/sanitizePrompt";
import StatusService from "../services/StatusService";
import { postGraph } from "./postGraph";

const { Agent } = models;

/** Has an agent write a new blog post: decides a topic (unless one is given), researches it, writes it, and finds an image.
 * @param options.topic An outline of the post. Optional. If none is provided, the agent chooses one.
 * @param options.maxWords The target word count of the post
 * @param status Optional. Marked in_progress when the work starts. The caller records the outcome.
 * @returns the post, ready for PostService.create (it is not saved here)
 */
export const writePost = async ({
  agentId,
  accountId,
  options,
  status,
}: {
  agentId: string;
  accountId?: string;
  options?: { maxWords?: number; topic?: string | null };
  status?: any;
}) => {
  console.log(`${agentId} is starting writePost`);
  if (status) {
    StatusService.updateInstance(status, { status: "in_progress" });
  }

  const { maxWords: requestedMaxWords = 1000, topic: requestedTopic = null } = options ?? {};

  // These come from the API caller and go into the prompt, so check them first
  const maxWords = Number(requestedMaxWords);
  if (!Number.isInteger(maxWords) || maxWords < 1 || maxWords > 10000) {
    throw new BadRequestError("maxWords must be a whole number between 1 and 10000.");
  }
  const topic = cleanText(requestedTopic, { maxLength: 2000 }) || null;

  // When an accountId is given, the agent must belong to it. Scheduled posts skip this check.
  const agent = await Agent.findOne({ where: { agentId, ...(accountId && { accountId }) } });
  if (!agent) throw new NotFoundError("Agent not found.");

  console.log(`${agent.username} started writing a blog post. model: ${agent.llm?.model}, maxWords: ${maxWords}, topic: ${topic}`);

  const { title, content, imageUrl } = await postGraph.invoke({ agent, maxWords, topic });

  console.log(`${agent.username} generated a new post.`);
  return {
    title,
    content,
    imageUrl,
    agentId: agent.agentId,
    authorId: agent.agentId,
    accountId: agent.accountId,
  };
};
