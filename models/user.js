"use strict";

const { BCRYPT_WORK_FACTOR } = require("../config");
const db = require("../db");
const bcrypt = require("bcrypt");
// const { sqlForPartialUpdate } = require("../helpers/sql");
const {
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
} = require("../expressError");

class User {
  /** Returns a list of all users
   * Doubles as a search for authors only if authors=true is passed
   *
   */

  static async getAllUsers(authors = false) {
    const res = await db.query(`
    SELECT 
      user_id AS "userId", 
      username, 
      is_author AS "isAuthor", 
      first_name AS "firstName", 
      last_name AS "lastName", 
      email, 
      author_bio AS "authorBio", 
      is_admin AS "isAdmin", 
      image_url AS "imageUrl"
    FROM users
    ${authors ? "WHERE is_author = true" : ""}
    ORDER BY username`);

    return res.rows;
  }

  /** Returns a single user along with their post history and comment history
   *
   *
   *
   */

  static async getUser(idType, idValue) {
    // id is optional. If id is passed, then id is used instead of username
    //

    const userResponse = await db.query(
      `SELECT 
      user_id AS "userId", 
      username, 
      is_author AS "isAuthor", 
      first_name AS "firstName", 
      last_name AS "lastName",
      email,
      author_bio AS "authorBio", 
      is_admin AS "isAdmin",
      image_url AS "imageUrl"
      FROM users
      WHERE ${idType} = $1`,
      [idValue]
    );

    // console.log('userResponse, user model',userResponse)

    if (!userResponse.rows[0])
      throw new NotFoundError(`Could not find: ${idType}: ${idValue}`);
    const user = userResponse.rows[0];

    // get the user's post titles and ids. Not the whole post.
    const userPostResponse = await db.query(
      `
      SELECT post_id AS "postId", created_at AS "createdAt", title_plaintext AS "titlePlaintext"
      FROM posts
      WHERE posts.user_id = $1
      ORDER BY created_at DESC`,
      [user.userId]
    );
    const userPosts = userPostResponse.rows;

    // get the user's comments
    const userCommentResponse = await db.query(
      `
    SELECT comment_id AS "commentId", user_id AS "userId", post_id AS "postId", created_at AS "createdAt", body
    FROM comments
    WHERE comments.user_id = $1`,
      [user.userId]
    );
    const userComments = userCommentResponse.rows;

    // append posts and comments to user
    user.posts = userPosts;
    user.comments = userComments;

    return user;
  }

  // Register a new user
  static async register({
    username,
    password,
    firstName,
    lastName,
    email,
    authorBio,
    isAdmin = false,
  }) {
    // first check for username duplicates
    const duplicateCheck = await db.query(
      `SELECT username
      FROM users
      WHERE username =$1`,
      [username]
    );
    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate username: ${username}`);

    // hash the password for storage
    const hashedPassword = await bcrypt.hash(password, BCRYPT_WORK_FACTOR);

    // console.log("hashed password:", hashedPassword);

    const result = await db.query(
      `INSERT INTO users 
        (username, password, first_name, last_name, email, author_bio, is_admin)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING username,
         first_name AS "firstName", last_name AS "last_name", author_bio AS "authorBio",
          user_id AS "userId",
           created_at AS "createdAt", 
           is_admin AS "isAdmin"`,
      [username, hashedPassword, firstName, lastName, email, authorBio, isAdmin]
    );

    const user = result.rows[0];
    return user;
  }

  // Login a user
  static async authenticate({ username, password }) {
    // first, find the user
    const result = await db.query(
      `SELECT username, password, user_id AS "userId",
       first_name AS "firstName", last_name AS "lastName", email, author_bio AS "authorBio", is_admin AS "isAdmin"
      FROM users
      WHERE username =$1`,
      [username]
    );
    const user = result.rows[0];

    if (user) {
      const isValid = await bcrypt.compare(password, user.password);
      if (isValid == true) {
        delete user.password; // be sure to delete this hashed password password before returning the user.
        return user;
      }
    }
    // if the password is not correct, throw an Unauthorized error
    throw new UnauthorizedError("Invalid username/password");
  }

  //
  /** PATCH route {user} => {user}
   *  Update a user's information
   *
   */
  static async updateUser(userId, updateCols, updateVals) {
    let userIdIndex = "$" + (updateVals.length + 1);

    const result = await db.query(
      `UPDATE users
      SET ${updateCols}
      WHERE user_id = ${userIdIndex}
      RETURNING 
        user_id AS "userId",
        username,
        is_author AS "isAuthor",
        first_name AS "firstName",
        last_name AS "lastName",
        email,
        author_bio AS "authorBio"`,
      [...updateVals, userId]
    );

    // console.log('RESULT',result)
    return result.rows[0];
  }
}

module.exports = User;

// want to have a range of columns to update
// and values for those columns
