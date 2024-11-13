"use strict";

// Routes for blog posts

const { requireAuth } = require("../../middleware/authorizations");
const express = require("express");

const router = express.Router({ mergeParams: true });
const CommentService = require("../../services/CommentService");
const AgentService = require("../../services/AgentService");
const StatusService = require("../../services/StatusService");

module.exports = (config) => {
  /**
   * @openapi
   * /comments:
   *   get:
   *     summary: Get all comments
   *     description: Get all comments for the
   *     tags: [Comments]
   *     responses:
   *       200:
   *         description: List of comments
   */
  router.get("/", async function (req, res, next) {
    const { accountId } = req.account;
    const { postId } = req.params;
    try {
      const comments = await CommentService.findAll({ accountId, postId });
      return res.sendResponse({ status: 200, data: comments });
    } catch (error) {
      return next(error);
    }
  });

  /**
   * @openapi
   * /comments/{commendId}:
   *   get:
   *     summary: Get a single comment
   *     tags: [Comments]
   *     responses:
   *       200:
   *         description: A single comment
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

  /**
   */
  router.get("/:postId/comments", async function (req, res, next) {
    try {
      const { postId } = req.params;
      const { comments, numComments } = await CommentService.getComments(
        postId
      );
      comments.numComments = numComments;
      return res.sendResponse({ status: 200, data: comments });
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
      const { accountId } = req.account;
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

  router.delete("/", async function (req, res, next) {
    try {
      const { commentId } = req.body;
      const { accountId } = req.account;
      const result = await CommentService.destroy({ commentId, accountId });
      return res.sendResponse({ status: 200, data: result });
    } catch (error) {
      next(error);
    }
  });

  return router;
};
