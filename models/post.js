"use strict";

const db = require("../db");
const {
  BadRequestError,
  NotFoundError,
  ExpressError,
} = require("../expressError");

class Post {
  /** GET
   * Returns all blog posts from the database, and the count of their posts
   * Optionally accepts a user_id as a search filter to only return posts by that user
   */
  static async getAllPosts() {
    const result = await db.query(`
    SELECT p.post_id, p.user_id, p.created_at, p.title_plaintext, p.body_plaintext, p.body_html,
    COUNT(comment_id) as num_comments 
    FROM posts p
    JOIN comments c ON p.post_id = c.post_id
    GROUP BY p.post_id`);
    return result.rows;
  }

  /** GET
   * Returns a single post, based on id
   * post Id is simply integer in sequence: 1 or 2 or 3...
   *
   *
   *  returns: A single post with all of its comments plus each comment's name
   *
   **/

  static async getSinglePost(postId) {
    const postResult = await db.query(
      `
    SELECT post_id, user_id AS "userId", created_at AS "createdAt", title_plaintext AS "titlePlaintext", body_plaintext AS "bodyPlaintext", body_html AS "bodyHtml"
    FROM posts
    WHERE post_id =$1`,
      [postId]
    );

    const post = postResult.rows[0];

    if (!post)
      throw new NotFoundError(`That post with id: ${postId} doesn't exist.`);

    const commentsResult = await db.query(
      `
    SELECT c.comment_id, c.user_id, c.created_at, c.body, u.first_name, u.last_name, u.username
    FROM comments c JOIN users u ON c.user_id = u.user_id
    WHERE post_id = $1
    ORDER BY c.created_at ASC`,
      [postId]
    );

    post.comments = commentsResult.rows;

    return post;
  }

  /** POST
   * Creates a new blog post entry.
   * Requires the userId of the author (must be registered user, but in my case it should always be the AI)
   * Requires the title and body as html and plaintext
   * Returns the newly created blog post
   *
   *
   *
   **/

  static async createNewPost({ userId, title, bodyPlaintext, bodyHtml }) {
    try {
      const result = await db.query(
        `
      INSERT INTO posts
      (user_id, title_plaintext, body_plaintext, body_html)
      VALUES ($1, $2, $3, $4)
      RETURNING post_id AS "postId", user_id AS "userId", created_at AS "createdAt", body_html AS "bodyHtml", title_plaintext AS "titlePlaintext", body_plaintext AS "bodyPlaintext"`,
        [userId, title, bodyPlaintext, bodyHtml]
      );

      const newPost = result.rows[0];
      return newPost;
    } catch (error) {
      return new ExpressError(error);
    }
  }

}
module.exports = Post;