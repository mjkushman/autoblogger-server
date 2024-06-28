"use strict";

const db = require("../db");
const {
  BadRequestError,
  NotFoundError,
  ExpressError,
} = require("../expressError");
const slug = require('slug');
const {nanoid} = require('nanoid');

class Post {
  /** GET
   * Returns all blog posts from the database, and the count of their posts
   * Optionally accepts a user_id as a search filter to only return posts by that user
   */
  static async getAllPosts() {
    const result = await db.query(`
    SELECT 

    p.post_id AS "postId", 
    p.user_id AS "userId", 
    p.created_at AS "createdAt", 
    p.title_plaintext AS "titlePlaintext",
    p.title_html AS "titleHtml", 
    p.body_plaintext AS "bodyPlaintext", 
    p.body_html AS "bodyHtml",
    p.image_url AS "postImageUrl",
    u.username,
    p.slug,
    u.image_url AS "authorImageUrl",
    COUNT(comment_id) AS "numComments"
    FROM posts p
    LEFT JOIN comments c ON p.post_id = c.post_id
    LEFT JOIN users u ON p.user_id = u.user_id
    GROUP BY p.post_id, username, u.image_url`);
    return result.rows;
  }


/** GET
 * Returns a list of post titles and post Ids, but not the entire post content or other details.
 * 
 */
  static async getTitles(userOrAgentId){
       // get the user's post titles and ids. Not the whole post.
       // Must determine if the id passed is user uuid or agent id, and work accordingly.

      let idType = userOrAgentId.length == 6? "agent_id" : "user_id"

       const result = await db.query(
        `
        SELECT post_id AS "postId", created_at AS "createdAt", title_plaintext AS "titlePlaintext"
        FROM posts
        WHERE posts.${idType} = $1
        ORDER BY created_at DESC`,
        [userOrAgentId]
      );
      return result.rows
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
      SELECT p.post_id AS "postId", 
      p.user_id AS "userId", 
      p.created_at AS "createdAt", 
      p.title_plaintext AS "titlePlaintext",
      p.title_html AS "titleHtml", 
      p.body_plaintext AS "bodyPlaintext", 
      p.body_html AS "bodyHtml", u.username,
      p.slug,
      p.image_url AS "postImageUrl", 
      u.image_url AS "authorImageUrl", 
      COUNT(c.comment_id) AS "numComments"
      FROM posts p
      LEFT JOIN comments c ON p.post_id = c.post_id
      LEFT JOIN users u ON p.user_id = u.user_id
      WHERE p.post_id =$1
      GROUP BY p.post_id, u.username, u.image_url`,
        [postId]

    );


    const post = postResult.rows[0];

    if (!post)
      throw new NotFoundError(`That post with id: ${postId} doesn't exist.`);


      // THIS BLOCK ADDS ALL THE COMMENTS TO THE RESPONSE
    const commentsResult = await db.query(
      `
    SELECT c.comment_id, c.user_id, c.created_at, c.body, u.first_name, u.last_name, u.username
    FROM comments c JOIN users u ON c.user_id = u.user_id
    WHERE post_id = $1
    ORDER BY c.created_at ASC`,
      [postId]
    );

    const comments = commentsResult.rows;

    return {post, comments};
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

  static async createNewPost({ userId, titleHtml, titlePlaintext, bodyHtml, bodyPlaintext,imageUrl, agentId }) {
    
    // url slug is derived from title
    
    const postId = nanoid(6) // create 6 character unique id
    const urlSlug = slug(titlePlaintext) // creates a url-friendly slug

    try {
      const insertRes = await db.query(
        `
      INSERT INTO posts
        (post_id,
          user_id, 
        title_html,
        title_plaintext, 
        body_html, 
        body_plaintext, 
        image_url,
        slug,
        agent_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING 
          post_id AS "postId", 
          user_id AS "userId", 
          agent_id AS "agentId",
          created_at AS "createdAt", 
          title_plaintext AS "titlePlaintext", 
          title_html AS "titleHtml", 
          body_plaintext AS "bodyPlaintext",
          body_html AS "bodyHtml", 
          image_url AS "imageUrl", 
          slug`,
        [postId,
          userId, 
          titleHtml,
          titlePlaintext, 
          bodyHtml,
          bodyPlaintext,
          imageUrl,
          urlSlug,
          agentId
          ]
      );


      const newPost = insertRes.rows[0];
      console.log('MODEL: NEWPOST:', newPost)

      return newPost;
    } catch (error) {
      return new ExpressError(error);
    }
  }

}
module.exports = Post;