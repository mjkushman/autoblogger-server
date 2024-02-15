

"use strict";

const db = require("../db");
// const bcrypt = require("bcrypt");
// const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

// const { BCRYPT_WORK_FACTOR } = require("../config.js");


class User {

/** Returns a list of all users */

  static async getAllUsers() {
    
    const result = await db.query(`
    SELECT user_id, username, first_name, last_name, email, author_bio, is_admin
    FROM users
    ORDER BY username`);

    return result.rows
  }

  /** Returns a single user along with their post history and comment history 
   * 
   * 
   * 
  */

  static async getUser(username) {
    
    const userResponse = await db.query(` 
      SELECT u.user_id, 
      username, 
      first_name, 
      last_name, 
      email,
      author_bio, 
      is_admin
      FROM users u
      WHERE username =$1`, [username]);

    if(!userResponse.rows[0]) throw new NotFoundError(`Could not find: ${username}`)
    const user = userResponse.rows[0]

    // get the user's post titles and ids. Not the whole post.
    const userPostResponse = await db.query(`
    SELECT post_id, created_at, title_plaintext
    FROM posts
    WHERE posts.user_id = $1
    ORDER BY created_at DESC`, [user.user_id])
    const userPosts = userPostResponse.rows
    
    // get the user's comments
    const userCommentResponse = await db.query(`
    SELECT comment_id, user_id, post_id, created_at, body
    FROM comments
    WHERE comments.user_id = $1`, [user.user_id])
    const userComments = userCommentResponse.rows

    // append posts and comments to user
    user.posts = userPosts
    user.comments = userComments
  
    return user
  }

  static async getUserById(userId) {
    
    const userResponse = await db.query(` 
      SELECT u.user_id, 
      username, 
      first_name, 
      last_name, 
      email,
      author_bio, 
      is_admin
      FROM users u
      WHERE user_id =$1`, [userId]);

    if(!userResponse.rows[0]) throw new NotFoundError(`Could not find: ${userId}`)
    const user = userResponse.rows[0]

    // get the user's post titles and ids. Not the whole post.
    const userPostResponse = await db.query(`
    SELECT post_id, created_at, title_plaintext
    FROM posts
    WHERE posts.user_id = $1
    ORDER BY created_at DESC`, [userId])
    const userPosts = userPostResponse.rows
    
    // get the user's comments
    const userCommentResponse = await db.query(`
    SELECT comment_id, user_id, post_id, created_at, body
    FROM comments
    WHERE comments.user_id = $1`, [userId])
    const userComments = userCommentResponse.rows

    // append posts and comments to user
    user.posts = userPosts
    user.comments = userComments
  
    return user
  }


}


module.exports = User;
