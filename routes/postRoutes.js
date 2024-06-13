"use strict";

// Routes for blog posts

const PostService = require("../models/post"); // import post model from models folder
const Comment = require("../models/comment"); // import comment model from models folder
const { verifyLoggedIn } = require("../middleware/authorizations");
const express = require("express");

const router = express.Router({ mergeParams: true });

module.exports = (config) => {
  // Middleware to extract orgId

  router.use((req,res,next) => {
    req.orgId = req.params.orgId;
    next();
  })

  const PostService = require("../services/PostService");
  const postService = new PostService(config.database.client);

  /** GET / return all blog posts for a given org
   *
   */
  router.get("/", async function (req, res, next) {
    const { orgId } = req;
    try {
      const posts = await postService.findAll(orgId);
      return res.json({ posts });
    } catch (error) {
      return next(error);
    }
  });

  /** GET / return a single blog article with comments
   *
   */
  router.get("/:postId", async function (req, res, next) {
    try {
      const post = await postService.findOne(req.params.postId);
      return res.json({ post });
      // Previously:
      //   return res.json({ post: result.post, comments: result.comments });
    } catch (error) {
      return next(error);
    }
  });

  /** POST / Create a new blog post.
   * req.body requires userId, title, bodyHtml, bodyPlaintext
   *
   */

  router.post("/", async function (req, res, next) {
      const { orgId } = req;
    try {
      // const {title, bodyPlaintext, bodyHtml} = req.body
      const post = await postService.create(req.body, orgId);

      console.log(post);
      return res.status(201).json({ post });
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
