"use strict";


import express from "express";
import rateLimit from "express-rate-limit";
import CommentService from "../../services/CommentService";
import AgentService from "../../services/AgentService";
import { replyToComment } from "../../agents/replyToComment";
import StatusService from "../../services/StatusService";
import { BadRequestError } from "../../utilities/expressError";
import { cleanText, looksLikeInjection } from "../../utilities/sanitizePrompt";
import { Config } from "../../types/Config.type";

const router = express.Router({ mergeParams: true });

const MAX_COMMENT_LENGTH = 1000;
const MAX_NAME_LENGTH = 50;

// Each new comment can trigger a paid AI reply, so limit how fast one visitor can post
const commentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { status: "Error", message: "You're commenting too quickly. Please wait a few minutes." },
});

export default (config: Config) => {
  /**
   * @openapi
   * /comments:
   *   get:
   *     tags: [Comments]
   *     summary: Gets all comments
   *     parameters:
   *      - in: query
   *        name: postId
   *        required: false
   *        schema:
   *          type: string
   *        description: Unique identifier for a post
   *        example: pst_0000000001
   *     security:
   *       - ApiKeyAuth: []
   *     responses:
   *       200:
   *         description: An array of comments. If postId is supplied, then returns comments for just that post.
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                  $ref: '#/components/schemas/Comment'
   *       400:
   *         description: Bad request (missing or invalid data)
   *       500:
   *         description: Internal server error while handling request
   */
  router.get("/", async function (req, res, next) {
    const { accountId } = res.locals.account;
    const { postId } = req.query;
    try {
      const comments = await CommentService.findAll({ accountId, postId });
      return res.sendResponse({ status: 200, data: comments.map(CommentService.toPublic) });
    } catch (error) {
      return next(error);
    }
  });

  /**
   * @openapi
   * /comments/{commentId}:
   *   get:
   *     tags: [Comments]
   *     summary: Gets one comment
   *     parameters:
   *      - in: path
   *        name: commentId
   *        required: true
   *        schema:
   *          type: string
   *        description: Unique identifier for a comment
   *        example: 100
   *     security:
   *       - ApiKeyAuth: []
   *     responses:
   *       200:
   *         description: An single comment
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Comment'
   *       400:
   *         description: Bad request (missing or invalid data)
   *       500:
   *         description: Internal server error while handling request
   */
  router.get("/:commentId", async function (req, res, next) {
    const { commentId } = req.params;
    const { accountId } = res.locals.account;
    try {
      const comment = await CommentService.findOne({ commentId, accountId });
      return res.sendResponse({ status: 200, data: CommentService.toPublic(comment) });
    } catch (error) {
      return next(error);
    }
  });

  /**
   * @openapi
   * /comments:
   *   post:
   *     tags: [Comments]
   *     summary: Adds a comment to a post
   *     description: >
   *       Saves the comment. If the post's author has comment replies turned on, the author writes
   *       a short reply in the background. The response then includes `reply.statusId`; poll
   *       `GET /status/{statusId}` until it reports `success`, then fetch the comments again.
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required: [postId, content]
   *             properties:
   *               postId:
   *                 type: string
   *                 example: pst_0000000001
   *               authorName:
   *                 type: string
   *                 description: Name to show with the comment (up to 50 characters). Defaults to "Guest".
   *                 example: Sam
   *               content:
   *                 type: string
   *                 description: The comment text (up to 1000 characters).
   *     security:
   *       - ApiKeyAuth: []
   *     responses:
   *       201:
   *         description: The saved comment, and the reply status if a reply is being written.
   *       400:
   *         description: Missing or invalid comment
   *       404:
   *         description: Post not found
   *       429:
   *         description: Too many comments from this visitor
   */
  router.post("/", commentLimiter, async function (req, res, next) {
    try {
      const { accountId } = res.locals.account;
      const { postId } = req.body;

      // Visitor text is untrusted: strip markup and hidden characters, and cap its length
      const content = cleanText(req.body.content, { maxLength: MAX_COMMENT_LENGTH });
      const authorName = cleanText(req.body.authorName, { maxLength: MAX_NAME_LENGTH }) || "Guest";
      if (!postId) throw new BadRequestError("postId is required.");
      if (!content) throw new BadRequestError("Please write a comment first.");

      const comment = await CommentService.create({ accountId, postId, authorName, content });
      const response = { comment: CommentService.toPublic(comment), reply: null };

      // Which agent wrote this post? Posts without one simply don't get a reply.
      const agent = await AgentService.findOneByPostId({ postId }).catch(() => null);
      // A comment that tries to give the AI orders is kept, but the AI doesn't answer it
      const isSuspicious = looksLikeInjection(content) || looksLikeInjection(authorName);
      const wantsReply = agent?.commentSettings?.isEnabled && !isSuspicious;

      if (!wantsReply) return res.sendResponse({ status: 201, data: response });

      const status = await StatusService.create("comment");
      response.reply = { statusId: status.statusId, status: status.status };
      res.sendResponse({ status: 201, data: response });

      // The reply is written after the response is sent, and reports its outcome on the status
      replyToComment({ agent, comment, status });
    } catch (error) {
      return next(error);
    }
  });

  /**
   * @openapi
   * /comments/{commentId}:
   *   delete:
   *     tags: [Comments]
   *     summary: Delete a comment
   *     parameters:
   *      - in: path
   *        name: commentId
   *        required: true
   *        schema:
   *          type: string
   *        description: Unique identifier for a comment
   *        example: '123'
   *     security:
   *       - ApiKeyAuth: []
   *     responses:
   *       200:
   *         description: Confirmation message
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/DeleteSuccess'
   *       400:
   *         description: Bad request (missing or invalid data)
   *       500:
   *         description: Internal server error while handling request
   */
  router.delete("/:commentId", async function (req, res, next) {
    try {
      const { commentId } = req.params;
      const { accountId } = res.locals.account;
      const result = await CommentService.destroy({ commentId, accountId });
      return res.sendResponse({ status: 200, data: result });
    } catch (error) {
      next(error);
    }
  });

  return router;
};
