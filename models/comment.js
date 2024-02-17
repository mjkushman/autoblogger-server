"use strict";

const db = require("../db");
const {
  BadRequestError,
  NotFoundError,
  ExpressError,
} = require("../expressError");

const createAiReply = require('../utilities/aiCommentor')

class Comment {
  /** POST add a comment to a post
   *  Adds a single comment to a single post.
   *  Requires userId, postId, and body
   */

  static async addComment(postId, { userId, body }) {
    const result = await db.query(
      `
    INSERT INTO comments (user_id, post_id, body)
    VALUES ($1, $2, $3)
    RETURNING comment_id, created_at, body`,
      [userId, postId, body]
    );

    const newComment = result.rows[0];
    return newComment;
  }

  static async addAiReply(postId) {
    // generate a reply by AI
    const {body, userId} = await createAiReply(postId)
    // INSERT the reply to database
    const result = await db.query(
      `
      INSERT INTO comments (user_id, post_id, body) 
      VALUES ($1, $2, $3) 
      RETURNING comment_id, created_at, body`,
      [userId, postId, body]
    );
    // return the reply to route
    const aiReply = result.rows[0];
    return aiReply;
  }
}

module.exports = Comment;
