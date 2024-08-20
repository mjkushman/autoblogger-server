"use strict";

// Routes for blog posts

const { verifyLoggedIn } = require("../middleware/authorizations");
const express = require("express");

const router = express.Router({ mergeParams: true });
const CommentService = require("../services/CommentService");
const PostService = require("../services/PostService");
const AgentService = require("../services/AgentService");
const StatusService = require("../services/StatusService");

module.exports = (config) => {
  /** Get all comments
   * @swagger
   * /{orgId}/comments:
   *   get:
   *     summary: Get all comments
   *     description: Get all comments for the org
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

      return res.status(200).json({ comments });
    } catch (error) {
      return next(error);
    }
  });

  /** Get all comments for one post
   * @swagger
   * /{orgId}/comments/post/{postId}:
   *   get:
   *     summary: Get all comments for one post
   *     description: Get all comments for post postId.
   *     tags: [Comments]
   *     responses:
   *       200:
   *         description: List of comments
   */
  router.get("/post/:postId", async function (req, res, next) {
    const { postId } = req.params;
    const { account } = req;
    try {
      const comments = await CommentService.findAllByPost({ postId, account });
      return res.json({ comments });
    } catch (error) {
      return next(error);
    }
  });

  /** Get all comments for one blog
   * @swagger
   * /{orgId}/comments/blog/{blogId}:
   *   get:
   *     summary: Get all comments for one post
   *     description: Get all comments for post postId.
   *     tags: [Comments]
   *     responses:
   *       200:
   *         description: List of comments
   */
  router.get("/blog/:blogId", async function (req, res, next) {
    const { blogId } = req.params;
    const { account } = req;
    try {
      const comments = await CommentService.findAllByBlog({ blogId, account });
      return res.json({ comments });
    } catch (error) {
      return next(error);
    }
  });

  /** Get one comment
   * @swagger
   *  /comments/{commentId}:
   *   get:
   *     summary: Get one comment
   *     description: Get get comment commentId
   *     tags: [Comments]
   *     responses:
   *       200:
   *         description: Details of one comment commentId
   */
  router.get("/:commentId", async function (req, res, next) {
    const { commentId } = req.params;
    try {
      const comment = await CommentService.findOne(commentId);
      return res.json({ comment });
    } catch (error) {
      return next(error);
    }
  });

  /** Get all comments for one post. Same as above
   * @swagger
   * /{orgId}/comments/{postId}/comments:
   *   get:
   *     summary: Get all comments for postId
   *     description: Get all comments for postId
   *     tags: [Comments]
   *     responses:
   *       200:
   *         description: List of comments
   */
  router.get("/:postId/comments", async function (req, res, next) {
    try {
      const postId = req.params.postId;
      const { comments, numComments } = await CommentService.getComments(
        postId
      );
      return res.status(200).json({ numComments, comments });
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
        res.status(201).send(response);

        // Proceed to generate the completion
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
      return res.status(201).json(response);
    } catch (error) {
      return next(error);
    }
  });
  return router;
};
