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

class OrgUser {
  /** Returns a list of all users
   * Doubles as a search for authors only if authors=true is passed
   *
   */

  static async getAll() {
    const res = await db.query(`
    SELECT 
      user_id AS "userId", 
      username, 
      first_name AS "firstName", 
      last_name AS "lastName", 
      email, 
      role
    FROM org_users
    ORDER BY username`);
    if (!res.rows)
      throw new NotFoundError();
    return res.rows;
  }

  /** Returns a single user along with their post history and comment history
   */
  static async getOne(userId) {
    const res = await db.query(
      `SELECT 
      user_id AS "userId", 
      username, 
      first_name AS "firstName", 
      last_name AS "lastName",
      email,      
      role
      FROM users
      WHERE user_id = $1`,
      [userId]
    );

    // console.log('userResponse, user model',userResponse)

    if (!res.rows[0])
      throw new NotFoundError(`Could not find: ${userId}`);
    const user = res.rows[0];

    return user;
  }

  // Register a new user
  static async register({
    username,
    password,
    firstName,
    lastName,
    email,
    role = 'user'
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
        (username, password, first_name, last_name, email, role)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING username,
         first_name AS "firstName", last_name AS "last_name",
          user_id AS "userId",
           created_at AS "createdAt", 
           role`,
      [username, hashedPassword, firstName, lastName, email, role]
    );

    const user = result.rows[0];
    return user;
  }

  // Login a user
  static async authenticate({ username, password }) {
    // first, find the user
    const result = await db.query(
      `SELECT username, password, user_id AS "userId",
       first_name AS "firstName", last_name AS "lastName", email, role
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
        email`,
      [...updateVals, userId]
    );

    // console.log('RESULT',result)
    return result.rows[0];
  }
}

module.exports = OrgUser;