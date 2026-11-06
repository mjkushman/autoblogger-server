import models from "../models";
import { cleanText } from "../utilities/sanitizePrompt";
import CommentService from "../services/CommentService";
import StatusService from "../services/StatusService";
import { generateText } from "./generate";
import { replyToCommentPrompts } from "./prompts/replyToComment";

const { Post } = models;

// A reply that arrives instantly feels robotic, so the author "reads" the comment first
const MIN_REPLY_DELAY_MS = 3000;
const MAX_REPLY_DELAY_MS = 12000;
const randomReplyDelay = () => MIN_REPLY_DELAY_MS + Math.random() * (MAX_REPLY_DELAY_MS - MIN_REPLY_DELAY_MS);

/** Writes a reply (plain text) to a reader's comment on one of the agent's posts. A single model call: no graph needed. */
export const generateComment = async ({ agent, comment, post }) => {
  const maxWords = agent.commentSettings?.maxWords ?? 100;

  // Everything a reader typed is fenced in tags and cleaned; the system prompt says to treat it as data
  const title = cleanText(post.title, { maxLength: 200 });
  const postText = cleanText(post.content, { maxLength: 8000 });
  const author = cleanText(comment.authorName, { maxLength: 50 });
  const commentText = cleanText(comment.content, { maxLength: 1000 });

  const reply = await generateText(agent, replyToCommentPrompts({ maxWords, title, postText, author, commentText }));
  return String(reply).trim().replace(/^["“]|["”]$/g, "");
};

/** Runs after the comment response is sent: writes the reply, saves it, and records the outcome on the status. */
export const replyToComment = async ({ agent, comment, status }) => {
  try {
    await StatusService.updateInstance(status, { status: "in_progress" });
    await new Promise((resolve) => setTimeout(resolve, randomReplyDelay()));
    const post = await Post.findByPk(comment.postId);
    const content = await generateComment({ agent, comment, post });
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
};
