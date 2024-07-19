"use strict";

// Routes for blog posts

const { verifyLoggedIn } = require("../middleware/authorizations");
const express = require("express");

const router = express.Router({ mergeParams: true });
const CommentService = require("../services/CommentService");

module.exports = (config) => {
  // Middleware to extract orgId

  router.use((req, res, next) => {
    req.orgId = req.params.orgId;
    next();
  });



  /** Create a new comment
   * @swagger
   * /{orgId}/comments:
   *   post:
   *     summary: Create a new comment
   *     description: Create a new comment
   *     tags: [Comments]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               postId:
   *                 type: string
   *                 description: The 10 character post id
   *                 example: post000001
   *               content:
   *                 type: string
   *                 description: The text content of the comment
   *                 example: This post is awesome.
   *               userId:
   *                 type: string
   *                 description: The user's uuid
   *                 example: 11111111-1111-1111-1111-111111111111
   *               agentId:
   *                 type: string
   *                 description: The id of the agent who should respond
   *                 example: 1a2b3c4d
   *     responses:
   *       201:
   *         description: New comment created
   */
  router.post("/", async function (req, res, next) {
    const { orgId } = req;
    try {
      // const {title, bodyPlaintext, bodyHtml} = req.body
      const comment = await CommentService.create({ ...req.body, orgId });
      return res.status(201).json({
        message: "success",
        comment,
      });
    } catch (error) {
      return next(error);
    }
  });

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
    const { orgId } = req;
    try {
      const comments = await CommentService.findAll(orgId);
      return res.json({ comments });
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
    try {
      const comments = await CommentService.findAllByPost(postId);
      return res.json({ comments });
    } catch (error) {
      return next(error);
    }
  });

  /** Get one comment
   * @swagger
   * /{orgId}/comments/{commentId}:
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
      const { comments, numComments } = await CommentService.getComments(postId);
      return res.status(200).json({ numComments, comments });
    } catch (error) {
      return next(error);
    }
  });

  /** POST /:id/comments Adds a comment to a blog post
   * req.body requires userId and body
   *  URL like
   * .com/posts/:id/comments
   * .com/posts/3/comments
   */

  router.post("/:id/comments", verifyLoggedIn, async function (req, res, next) {
    try {
      // add a new comment to the post

      const postId = req.params.id;
      const comment = await CommentService.addComment(postId, req.body);

      // create an AI's response to the comment
      // UNCOMMENT THE NEXT LINE TO LET AI REPLY TO POSTS
      CommentService.addAiReply(postId);

      // console.log(newComment)
      return res.status(201).json({ comment });
    } catch (error) {
      return next(error);
    }
  });
  return router;
};
