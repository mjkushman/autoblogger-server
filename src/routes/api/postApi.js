"use strict";

// Routes for blog posts

const Comment = require("../../models/Comment"); // import comment model from models folder
const { requireAuth } = require("../../middleware/authorizations");
const express = require("express");

const router = express.Router({ mergeParams: true });
import PostService from "../../services/PostService";
const CommentService = require("../../services/CommentService");
const AgentService = require("../../services/AgentService");
import verifyAgentOwnership from "../../middleware/verifyAgentOwnership";
const { Status } = require("../../models");
const StatusService = require("../../services/StatusService");

module.exports = (config) => {
  /**
   * @openapi
   * /posts:
   *   post:
   *     tags: [Posts]
   *     summary: Generates a new post written by an AI Agent
   *     security:
   *       - ApiKeyAuth: []
   *     requestBody:
   *        required: true
   *        content:
   *          application/json:
   *            schema:
   *              $ref: '#/components/schemas/NewPostByAgentBody'
   *     responses:
   *       201:
   *         description: Responds with a status ID while the post is generated asynchonously
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/NewPostByAgentSuccess'
   *       400:
   *         description: Bad request (missing or invalid data)
   *       500:
   *         description: Internal server error during post generation
   */
  router.post("/", verifyAgentOwnership, async function (req, res, next) {
    // body will have fields optionally filled out. Use them to replace whatever the generated post comes back with

    // USE THIS TO VERIFY REQUEST WITHOUT DOING FURTHER LOGIC
    // return res.status(201).json({message: "generate request received"})

  

    // immediately send back a status
    const status = await StatusService.create("post");
    res.sendResponse({ status: 201, data: status });
    console.log('about to enter try catch')
    try {
      const { agentId, options } = req.body;
      console.log('about to generate')
      const generatedPost = await AgentService.writePost({
        agentId,
        options,
        status,
      });
      console.log('generated, about to save post')
      const newPost = await PostService.create(generatedPost); // save the newly written post

      if (newPost) {
        StatusService.updateInstance(status, {
          status: "success",
          result: { post: newPost },
        });
      }
      return;
    } catch (error) {
      console.log(error);
      StatusService.updateInstance(status, {
        status: "error",
        result: "Unable to generate",
      });
      return;
    }
  });

  /**
   * @openapi
   * /posts:
   *   get:
   *     tags: [Posts]
   *     summary: Gets all posts for your account
   *     parameters:
   *      - in: query
   *        name: comments
   *        schema:
   *          type: boolean
   *        description: Whether or not to include comments in the response. Defaults to false.
   *        default: false  
   *     security:
   *       - ApiKeyAuth: []
   *     responses:
   *       200:
   *         description: An array of blog posts
   *         content:
   *           application/json:
   *             schema:
   *               type: array
   *               items:
   *                  $ref: '#/components/schemas/Post'
   *       400:
   *         description: Bad request (missing or invalid data)
   *       500:
   *         description: Internal server error while handling request
   */
  router.get("/", async function (req, res, next) {
    const { accountId } = res.locals.account;
    const { comments = false } = req.query;
    try {
      const posts = await PostService.findAll({accountId, comments});

      return res.sendResponse({ status: 200, data: posts });
    } catch (error) {
      next(error);
    }
  });

  /**
   * @openapi
   * /posts/{postId}:
   *   get:
   *     tags: [Posts]
   *     summary: Gets a single blog post
   *     parameters:
   *      - in: path
   *        name: postId
   *        required: true
   *        schema:
   *          type: string
   *        description: Unique identifier for a post
   *        example: 'pst_0000000001'
   *      - in: query
   *        name: comments
   *        schema:
   *          type: boolean
   *        description: Whether or not to include comments in the response. Defaults to false.
   *        default: false  
   * 
   *     security:
   *       - ApiKeyAuth: []
   *     responses:
   *       200:
   *         description: A single blog post
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Post'
   *       400:
   *         description: Bad request (missing or invalid data)
   *       500:
   *         description: Internal server error while handling request
   */
  router.get("/:postId", async function (req, res, next) {
    const { postId } = req.params;
    const { accountId } = res.locals.account;
    const { comments = false } = req.query;
    try {
      const post = await PostService.findOne({ postId, accountId, comments });

      return res.sendResponse({ status: 200, data: post });
    } catch (error) {
      return next(error);
    }
  });

  /**
   * @openapi
   * /posts/{postId}:
   *   delete:
   *     tags: [Posts]
   *     summary: Deletes a single post
   *     parameters:
   *      - in: path
   *        name: postId
   *        required: true
   *        schema:
   *          type: string
   *        description: Unique identifier for a post
   *        example: 'pst_0000000001'
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
  router.delete("/:postId", async function (req, res, next) {
    try {
      const { account } = res.locals;
      const { accountId } = account;
      const { postId } = req.params;

      const result = await PostService.delete({ accountId, postId });
      return res.sendResponse({ status: 200, data: result });
    } catch (error) {
      next(error);
    }
  });

  // This should just be in the Comment API

  // router.get("/:postId/comments", async function (req, res, next) {
  //   try {
  //     const { postId } = req.params;
  //     const { orgId } = req;
  //     const comments = await CommentService.findAllByPost({ orgId, postId });
  //     return res.sendResponse({ status: 200, data: comments });
  //   } catch (error) {
  //     return next(error);
  //   }
  // });

  // This should also be a Comment api since it modifies the Comments resource

  router.post(
    "/:postId/comments",
    requireAuth,
    async function (req, res, next) {
      try {
        // add a new comment to the post

        const { postId } = req.params;
        const { orgId } = res.locals;
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
        return res.sendResponse({
          status: 201,
          data: comment,
          message: "Comment created",
        });
      } catch (error) {
        return next(error);
      }
    }
  );

  return router;
};
