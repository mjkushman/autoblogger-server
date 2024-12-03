"use strict";

// Routes for blog posts

const { requireAuth } = require("../../middleware/authorizations");
const express = require("express");

const router = express.Router({ mergeParams: true });
const CommentService = require("../../services/CommentService");
const AgentService = require("../../services/AgentService");
const StatusService = require("../../services/StatusService");
const { BadRequestError } = require("../../utilities/expressError");

module.exports = (config) => {
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
    const { accountId } = req.locals.account;
    const { postId } = req.query;
    try {
      const comments = await CommentService.findAll({ accountId, postId });
      console.log("COMMENTS", comments);
      return res.sendResponse({ status: 200, data: comments });
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
    try {
      const comment = await CommentService.findOne(commentId);
      return res.sendResponse({ status: 200, data: comment });
    } catch (error) {
      return next(error);
    }
  });

  /** POST /comments
   * Create a new comment. Trigger reply generation if enabled.
   *
   *
   */

  router.post("/", async function (req, res, next) {
    try {
      const { accountId } = req.locals.account;
      const { postId } = req.body;

      let response = { comment: null, reply: null }; // Placeholders for comment and agent reply
      // Create a new comment
      const comment = await CommentService.create({
        accountId,
        ...req.body,
      });

      response.comment = {
        commentId: comment.commentId,
        parentId: comment.parentId,
        userId: comment.userId,
        postId: comment.postId,
        content: comment.content,
        authorFirstName: comment.User.firstName,
        authorUsername: comment.User.username,
        createdAt: comment.createdAt,
      };

      // get the post author id
      const agent = await AgentService.findOneByPostId({ postId });

      if (agent.commentSettings.isEnabled) {
        // If agent commenting is enabled

        // Immediately create a status and return the result
        const status = await StatusService.create("comment");

        response.reply = { status };
        res.sendResponse({ status: 201, data: response });

        // Proceed to generate the completion async after response is sent
        const { agentId } = agent;
        const completion = await AgentService.generateComment({
          agent,
          comment,
          status,
        });
        if (completion) {
          StatusService.updateInstance(status, {
            status: "success",
            result: completion,
          });
          // save the generated comment
          await CommentService.create({
            accountId,
            content: completion,
            agentId: agentId,
            parentId: comment.commentId,
          });
        }
        return;
      }
      return res.sendResponse({ status: 201, data: response });
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
  router.delete("/", async function (req, res, next) {
    try {
      const { commentId } = req?.params;
      if (!commentId || commentId <= 1)
        throw new BadRequestError((message = "Valid commentId is required"));
      const { accountId } = req.locals.account;
      const result = await CommentService.destroy({ commentId, accountId });
      return res.sendResponse({ status: 200, data: result });
    } catch (error) {
      next(error);
    }
  });

  return router;
};
