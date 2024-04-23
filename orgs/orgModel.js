// The model for interacting with Organizations in databse

"use strict";

const db = require("../db");
const {
  BadRequestError,
  NotFoundError,
  ExpressError,
} = require("../expressError");

const { nanoid } = require("nanoid");

class Org {
  /** Returns all organizaitons */

  static async getAllOrgs() {
    try {
      const result = await db.query(
        `SELECT org_id AS "orgId",
            name AS "name",
            contact_email AS "contactEmail",
                plan AS "plan"
                FROM orgs`
      );
      return result.rows;
    } catch (error) {
      consnole.log("OH SNAP!:", error);
    }
  }

  /** Returns a single organizaiton */
  static async getOrg(orgId) {
    try {
      const result = await db.query(
        `SELECT org_id AS "orgId",
                name AS "name",
                contact_email AS "contactEmail",
                plan AS "plan"
                FROM orgs
                WHERE org_id =$1`,
        [orgId]
      );
      return result.rows[0];
    } catch (error) {
      console.log("OH SNAP!:", error);
    }
  }

  static async createOrg(name,contactEmail,plan){
    try {
        const result = await db.query(
            `INSERT INTO orgs (name, contact_email, plan)
            VALUES ($1, $2, $3)
            RETURNING 
            org_id AS "orgId",
            name AS "name",
             contact_email AS "contactEmail",
             plan AS "plan"`,[name,contactEmail,plan]
        )
        return result.rows[0]
    } catch (error) {
        console.log("OH SNAP!:", error);
        return "somethign went wrong"
    }
  }
}

module.exports = Org;
