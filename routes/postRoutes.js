"use strict";

// Routes for blog posts

const Comment = require("../models/comment"); // import comment model from models folder
const { verifyLoggedIn } = require("../middleware/authorizations");
const express = require("express");

const router = express.Router({ mergeParams: true });

module.exports = (config) => {
  // Middleware to extract orgId

  router.use((req, res, next) => {
    req.orgId = req.params.orgId;
    next();
  });

  const PostService = require("../services/PostService");
  const postService = new PostService(config.database.client);

  const CommentService = require("../services/CommentService");
  const commentService = new CommentService(config.database.client);

  /** POST / Create a new blog post.
   * /111111/posts ==> creates a  post
   * req.body requires userId, title, bodyHtml, bodyPlaintext */
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

  /** GET / return all blog posts for a given org
   *  /111111/posts/ ==> Returns all posts for org 111111
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

  /** GET / return a single blog article (with comments?)
   * /111111/posts/post000001 ==> single post
   */
  router.get("/:postId", async function (req, res, next) {
    const { orgId } = req;
    const {postId} = req.params
    try {
      const post = await postService.findOne({postId, orgId});
      return res.json({ post });
    } catch (error) {
      return next(error);
    }
  });

  /** GET /:id/comments Gets comments for a post */
  router.get("/:postId/comments", async function (req, res, next) {
    try {
      const { postId } = req.params;
      const { orgId } = req;
      const comments = await commentService.findAllByPost({ orgId, postId });
      return res.status(200).json(
        {
        msg:`Returning comments for post ${postId} from org ${orgId}`,
        comments
    });
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
  router.post("/:postId/comments", verifyLoggedIn, async function (req, res, next) {
    try {
      // add a new comment to the post

      const {postId} = req.params;
      const { orgId } = req;
      const comment = await commentService.create({orgId,postId, ...req.body});

      // TODO: Change this to a function from agentService
      // create an AI's response to the comment
      // UNCOMMENT THE NEXT LINE TO LET AI REPLY TO POSTS
    //   Comment.addAiReply(postId);

      // console.log(newComment)
      return res.status(201).json(
        { msg: `Created a comment on post ${postId}`,
         comment
         });
    } catch (error) {
      return next(error);
    }
  });
  return router;
};
