// The model for interacting with Organizations in databse

"use strict";

const db = requier('../db')
const {BadRequestError, NotFoundError, ExpressError} = require('../expressError')

const {nanoid} = require("nanoid")

class Org {

    /** Returns all organizaitons */
    static async getAllOrgs(){
        const result = db.query(
            `SELECT org_id AS "orgId",
            name AS "name",
            contact_email AS "contactEmail",
            plan AS "plan
            FROM orgs`
        )
        return result.rows
    }

    /** Returns a single organizaiton */
    static async getOrg(orgId){
        
        const result = db.query(
            `SELECT org_id AS "orgId",
            name AS "name",
            contact_email AS "contactEmail",
            plan AS "plan
            FROM orgs
            WHERE org_id =$1`, [orgId]
        )
        return result.rows[0]
    }
}
