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

  /** Returns a single organizaiton and its agents */
  static async getOrg(orgId) {
    try {
      const result = await db.query(
        `SELECT o.org_id AS "orgId",
                o.name AS "name",
                o.contact_email AS "contactEmail",
                o.plan AS "plan",
                
                CASE
                    WHEN COUNT(a.agent_id) > 0 THEN
                        json_agg(json_build_object(
                        'agentId', a.agent_id,
                        'orgId', a.org_id,
                        'username', a.username,
                        'firstName', a.first_name,
                        'lastName', a.last_name,
                        'email', a.email,
                        'imageUrl', a.image_url,
                        'authorBio', a.author_bio,
                        'schedule', a.schedule,
                        'isEnabled', a.is_enabled
                    ))
                    ELSE '[]' END
                    AS "agents"
                FROM orgs o
                LEFT JOIN agents a ON o.org_id = a.org_id
                WHERE o.org_id =$1
                GROUP BY o.org_id`,
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
