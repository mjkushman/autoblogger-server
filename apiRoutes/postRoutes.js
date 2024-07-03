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

  /** Create a post
   * @swagger
   * /{orgId}/posts:
   *   post:
   *     summary: Manually create a new blog post
   *     description: Creates a new blog post. Should be used sparingly since your agent creates posts automatically.
   *     tags: [Posts]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               userId:
   *                 type: string
   *                 description: The ID of the user creating the post
   *                 example: 11111111-1111-1111-1111-111111111111
   *               title:
   *                 type: string
   *                 description: The title of the blog post
   *                 example: My First Blog Post
   *               bodyHtml:
   *                 type: string
   *                 description: The HTML content of the blog post
   *                 example: "<p>This is the HTML content of the post.</p>"
   *               bodyPlaintext:
   *                 type: string
   *                 description: The plain text content of the blog post
   *                 example: "This is the plain text content of the post."
   *     responses:
   *       201:
   *         description: New blog post created
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 post:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       description: The ID of the created post
   *                       example: 1a2b3c4d
   *                     userId:
   *                       type: string
   *                       description: The ID of the user who created the post
   *                       example: 11111111-1111-1111-1111-111111111111
   *                     title:
   *                       type: string
   *                       description: The title of the blog post
   *                       example: My First Blog Post
   *                     bodyHtml:
   *                       type: string
   *                       description: The HTML content of the blog post
   *                       example: "<p>This is the HTML content of the post.</p>"
   *                     bodyPlaintext:
   *                       type: string
   *                       description: The plain text content of the blog post
   *                       example: "This is the plain text content of the post."
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
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

  /** GET all posts
   * @swagger
   * /{orgId}/posts:
   *  get:
   *    description: return all blog posts for a given org
   *    tags: [Posts]
   *    responses:
   *      200:
   *        description: A list of posts
   */
  router.get("/", async function (req, res, next) {
    // TODO: Add authentication middleware
    const { orgId } = req;
    try {
      const posts = await postService.findAll(orgId);
      return res.json({ posts });
    } catch (error) {
      return next(error);
    }
  });

  /** GET one post
   * @swagger
   * /{orgId}/posts/{postId}:
   *   get:
   *     summary: Return a single blog post
   *     tags: [Posts]
   *     responses:
   *       200:
   *         description: A single post
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 post:
   *                   type: object
   *                   properties:
   *                     id:
   *                       type: string
   *                       description: The user ID.
   *                       example: 1
   *                     username:
   *                       type: string
   *                       description: The user's username.
   *                       example: johndoe
   *                     email:
   *                       type: string
   *                       description: The user's email address.
   *                       example: johndoe@example.com
   *       400:
   *         description: Bad request
   *       500:
   *         description: Internal server error
   */
  router.get("/:postId", async function (req, res, next) {
    // TODO: Add authentication logic
    const { orgId } = req;
    const { postId } = req.params;
    try {
      const post = await postService.findOne({ postId, orgId });
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
        const comment = await commentService.create({
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
