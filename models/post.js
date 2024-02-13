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
    GROUP BY p.post_id`)
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
    SELECT post_id, user_id, created_at, title_plaintext, body_plaintext, body_html 
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
    WHERE post_id = $1`,
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
      RETURNING post_id, user_id, created_at, body_html, body_plaintext`,
        [userId, title, bodyPlaintext, bodyHtml]
      );

      const newPost = result.rows[0];
      return newPost;
    } catch (error) {
      return new ExpressError(error);
    }
  }



/** POST add a comment to a post
 *  Adds a single comment to a single post.
 *  Requires userId, postId, and body
 */

  static async addComment (postId, {userId,body} ) {
    const result = await db.query(`
    INSERT INTO comments (user_id, post_id, body)
    VALUES ($1, $2, $3)
    RETURNING comment_id, created_at, body`,[userId, postId, body])

    const newComment = result.rows[0]
    return newComment
  } 

}



module.exports = Post;

//================================ BELOW HERE IS THE OLD FILE ===============================================

// "use strict";

// const db = require("../db");
// const { BadRequestError, NotFoundError } = require("../expressError");
// const { sqlForPartialUpdate } = require("../helpers/sql");

// /** Related functions for companies. */

// class Company {
//   /** Create a company (from data), update db, return new company data.
//    *
//    * data should be { handle, name, description, numEmployees, logoUrl }
//    *
//    * Returns { handle, name, description, numEmployees, logoUrl }
//    *
//    * Throws BadRequestError if company already in database.
//    * */

//   static async create({ handle, name, description, numEmployees, logoUrl }) {
//     const duplicateCheck = await db.query(
//           `SELECT handle
//            FROM companies
//            WHERE handle = $1`,
//         [handle]);

//     if (duplicateCheck.rows[0])
//       throw new BadRequestError(`Duplicate company: ${handle}`);

//     const result = await db.query(
//           `INSERT INTO companies
//            (handle, name, description, num_employees, logo_url)
//            VALUES ($1, $2, $3, $4, $5)
//            RETURNING handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl"`,
//         [
//           handle,
//           name,
//           description,
//           numEmployees,
//           logoUrl,
//         ],
//     );
//     const company = result.rows[0];

//     return company;
//   }

//   /** Find all companies (optional filter on searchFilters).
//    *
//    * searchFilters (all optional):
//    * - minEmployees
//    * - maxEmployees
//    * - name (will find case-insensitive, partial matches)
//    *
//    * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
//    * */

//   static async findAll(searchFilters = {}) {
//     let query = `SELECT handle,
//                         name,
//                         description,
//                         num_employees AS "numEmployees",
//                         logo_url AS "logoUrl"
//                  FROM companies`;
//     let whereExpressions = [];
//     let queryValues = [];

//     const { minEmployees, maxEmployees, name } = searchFilters;

//     if (minEmployees > maxEmployees) {
//       throw new BadRequestError("Min employees cannot be greater than max");
//     }

//     // For each possible search term, add to whereExpressions and queryValues so
//     // we can generate the right SQL

//     if (minEmployees !== undefined) {
//       queryValues.push(minEmployees);
//       whereExpressions.push(`num_employees >= $${queryValues.length}`);
//     }

//     if (maxEmployees !== undefined) {
//       queryValues.push(maxEmployees);
//       whereExpressions.push(`num_employees <= $${queryValues.length}`);
//     }

//     if (name) {
//       queryValues.push(`%${name}%`);
//       whereExpressions.push(`name ILIKE $${queryValues.length}`);
//     }

//     if (whereExpressions.length > 0) {
//       query += " WHERE " + whereExpressions.join(" AND ");
//     }

//     // Finalize query and return results

//     query += " ORDER BY name";
//     const companiesRes = await db.query(query, queryValues);
//     return companiesRes.rows;
//   }

//   /** Given a company handle, return data about company.
//    *
//    * Returns { handle, name, description, numEmployees, logoUrl, jobs }
//    *   where jobs is [{ id, title, salary, equity }, ...]
//    *
//    * Throws NotFoundError if not found.
//    **/

//   static async get(handle) {
//     const companyRes = await db.query(
//           `SELECT handle,
//                   name,
//                   description,
//                   num_employees AS "numEmployees",
//                   logo_url AS "logoUrl"
//            FROM companies
//            WHERE handle = $1`,
//         [handle]);

//     const company = companyRes.rows[0];

//     if (!company) throw new NotFoundError(`No company: ${handle}`);

//     const jobsRes = await db.query(
//           `SELECT id, title, salary, equity
//            FROM jobs
//            WHERE company_handle = $1
//            ORDER BY id`,
//         [handle],
//     );

//     company.jobs = jobsRes.rows;

//     return company;
//   }

//   /** Update company data with `data`.
//    *
//    * This is a "partial update" --- it's fine if data doesn't contain all the
//    * fields; this only changes provided ones.
//    *
//    * Data can include: {name, description, numEmployees, logoUrl}
//    *
//    * Returns {handle, name, description, numEmployees, logoUrl}
//    *
//    * Throws NotFoundError if not found.
//    */

//   static async update(handle, data) {
//     const { setCols, values } = sqlForPartialUpdate(
//         data,
//         {
//           numEmployees: "num_employees",
//           logoUrl: "logo_url",
//         });
//     const handleVarIdx = "$" + (values.length + 1);

//     const querySql = `UPDATE companies
//                       SET ${setCols}
//                       WHERE handle = ${handleVarIdx}
//                       RETURNING handle,
//                                 name,
//                                 description,
//                                 num_employees AS "numEmployees",
//                                 logo_url AS "logoUrl"`;
//     const result = await db.query(querySql, [...values, handle]);
//     const company = result.rows[0];

//     if (!company) throw new NotFoundError(`No company: ${handle}`);

//     return company;
//   }

//   /** Delete given company from database; returns undefined.
//    *
//    * Throws NotFoundError if company not found.
//    **/

//   static async remove(handle) {
//     const result = await db.query(
//           `DELETE
//            FROM companies
//            WHERE handle = $1
//            RETURNING handle`,
//         [handle]);
//     const company = result.rows[0];

//     if (!company) throw new NotFoundError(`No company: ${handle}`);
//   }
// }

// module.exports = Company;
