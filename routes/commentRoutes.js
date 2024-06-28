"use strict";

// Routes for blog posts

const { verifyLoggedIn } = require("../middleware/authorizations");
const express = require("express");

const router = express.Router({ mergeParams: true });

module.exports = (config) => {
  // Middleware to extract orgId

  router.use((req, res, next) => {
    req.orgId = req.params.orgId;
    next();
  });

  const CommentService = require("../services/CommentService");
  const commentService = new CommentService(config.database.client);

  /** POST / Create a new comment.
   * /111111/comments/ => creates a new comment. Requires postID in the body
   *
   */

  router.post("/", async function (req, res, next) {
    const { orgId } = req;
    try {
      // const {title, bodyPlaintext, bodyHtml} = req.body
      const comment = await commentService.create({ ...req.body, orgId });
      return res.status(201).json({
        message: "success",
        comment,
      });
    } catch (error) {
      return next(error);
    }
  });

  /** GET / return all blog posts for a given org
   *
   */
  router.get("/", async function (req, res, next) {
    const { orgId } = req;
    try {
      const comments = await commentService.findAll(orgId);
      return res.json({ comments });
    } catch (error) {
      return next(error);
    }
  });

  /** GET / All comments for a single post
   */
  router.get("/post/:postId", async function (req, res, next) {
    const { postId } = req.params;
    try {
      const comments = await commentService.findAllByPost(postId);
      return res.json({ comments });
    } catch (error) {
      return next(error);
    }
  });

  router.get("/:commentId", async function (req, res, next) {
    const { commentId } = req.params;
    try {
      const comment = await commentService.findOne(commentId);
      return res.json({ comment });
    } catch (error) {
      return next(error);
    }
  });

  /** GET /:id/comments Gets comments for a post
   *
   *  URL like
   * .com/posts/:id/comments
   * .com/posts/3/comments
   */

  router.get("/:id/comments", async function (req, res, next) {
    try {
      const postId = req.params.id;
      const { comments, numComments } = await Comment.getComments(postId);
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
      const comment = await Comment.addComment(postId, req.body);

      // create an AI's response to the comment
      // UNCOMMENT THE NEXT LINE TO LET AI REPLY TO POSTS
      Comment.addAiReply(postId);

      // console.log(newComment)
      return res.status(201).json({ comment });
    } catch (error) {
      return next(error);
    }
  });
  return router;
};
