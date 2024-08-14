"use strict";

// Routes for blog posts

const Comment = require("../models/Comment_new"); // import comment model from models folder
const { verifyLoggedIn } = require("../middleware/authorizations");
const express = require("express");

const router = express.Router({ mergeParams: true });
const PostService = require("../services/PostService");
const CommentService = require("../services/CommentService");
const AgentService = require("../services/AgentService");
const { verifyAgentOwnership } = require("../middleware/verifyAgentOwnership");
const { Status } = require("../models");
const StatusService = require("../services/StatusService");

module.exports = (config) => {
  /** Generate a post
   * @swagger
   */
  router.post("/", verifyAgentOwnership, async function (req, res, next) {
    // body will have fields optionally filled out. Use them to replace whatever the generated post comes back with

    // USE THIS TO VERIFY REQUEST WITHOUT DOING FURTHER LOGIC
    // return res.status(201).json({message: "generate request received"})

    const { body, account } = req;

    // return res.json({agentId, options, titlePlaintext, titleHtml, bodyPlaintext, imageUrl})

    // immediately send back a status
    const status = await StatusService.create("post");
    res.status(200).send(status);
    try {

      const generatedPost = await AgentService.writePost({ body, status });
      console.log("exited writePost"); // remove after debugging

      const newPost = await PostService.create(generatedPost); // save the newly written post
      
      if (newPost) {
        status.update({ staus: "success", result: newPost });
        StatusService.updateInstance(status, {
          status: "success",
          result: {
            postId: newPost.postId,
            newPost,
          },
        });
      }

      return;
      // return res.status(201).json(newPost);
    } catch (error) {
      console.log(error)
      StatusService.updateInstance(status, {
        status: "error",
        result: error.message,
      })
      return error;
    }
  });

  /** GET all posts
   * @swagger
   */
  router.get("/", async function (req, res, next) {
    const { account } = req;

    const blogIds = account.Blogs.map((blog) => blog.blogId);
    try {
      const posts = await PostService.findAll(blogIds);
      return res.json({ posts });
    } catch (error) {
      next(error);
    }
  });

  /** GET one post
   * @swagger
   */
  router.get("/:postId", async function (req, res, next) {
    const { postId } = req.params;
    const { account } = req;
    const blogIds = account.Blogs.map((blog) => blog.blogId);
    try {
      const post = await PostService.findOne({ postId, blogIds });
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
      const comments = await CommentService.findAllByPost({ orgId, postId });
      return res.status(200).json({
        msg: `Returning comments for post ${postId} from org ${orgId}`,
        comments,
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
  router.post(
    "/:postId/comments",
    verifyLoggedIn,
    async function (req, res, next) {
      try {
        // add a new comment to the post

        const { postId } = req.params;
        const { orgId } = req;
        const comment = await CommentService.create({
          orgId,
          postId,
          ...req.body,
        });

        // TODO: Change this to a function from agentService
        // create an AI's response to the comment
        // UNCOMMENT THE NEXT LINE TO LET AI REPLY TO POSTS
        //   Comment.addAiReply(postId);

        // console.log(newComment)
        return res
          .status(201)
          .json({ msg: `Created a comment on post ${postId}`, comment });
      } catch (error) {
        return next(error);
      }
    }
  );
  return router;
};
