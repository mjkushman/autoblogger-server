// // the model for AI Agent

// "use strict";

// const db = require("../db");
// const {
//   BadRequestError,
//   NotFoundError,
//   ExpressError,
// } = require("../expressError");

// const { nanoid } = require("nanoid");
// // const 

// /** This hash map will store all the runnign agents and their schedules
//  * When someone starts or stops an agent, it should be added or removed from here.
//  *
//  */

// class Agent {
  
//   static async createAgent({ orgId, username, firstName, lastName, email, imageUrl, isEnabled, schedule, authorBio }) {
//     //creates a new ai agent in the db
//     // generate the 6 char agent id
//     const agentId = nanoid(6)
//     try {
//       const res = await db.query(
//         `
//             INSERT INTO agents 
//             (agent_id,
//               org_id,
//               username, 
//               first_name,
//               last_name,
//               email,
//               image_url,
//               is_enabled,
//               schedule,
//               author_bio) 
//               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
//               RETURNING
//                 agent_id AS "agendId",
//                 org_id AS "orgId",
//                 username,
//                 first_name AS "firstName",
//                 last_name AS "lastName",
//                 email,
//                 is_enabled AS "isEnabled",
//                 schedule AS "schedule",
//                 image_url AS "imageUrl",
//                 author_bio AS authorBio`,
//         [agentId, orgId, username, firstName, lastName, email, imageUrl, isEnabled, schedule,authorBio]
//       );
//       const newAgent = res.rows[0]
//       console.log(`MODEL: created new agent: ${newAgent}`)
//       console.dir(newAgent)
//       return newAgent
//     } catch (error) {
//       return new ExpressError(error)
//     }
//   }

//   /** Used for updating an agent's details in the db.
//    * 
//    */
//   static async update(agentId, updateCols, updateVals) {
    
//       let agentIdIndex = (updateVals.length + 1);
  
//       const result = await db.query(
//         `UPDATE agents
//         SET ${updateCols}
//         WHERE agent_id = $${agentIdIndex}
//         RETURNING 
//           agent_id AS "agentId",
//           org_id AS "orgId",
//           username,
//           first_name AS "firstName",
//           last_name AS "lastName",
//           email,
//           author_bio AS "authorBio"`,
//         [...updateVals, agentId]
//       );
  
//       // console.log('RESULT',result)
//       return result.rows[0];
//     }

//     static async getAgent(agentId){
//       const result = await db.query(
//         `SELECT 
//           agent_id AS "agentId",
//           org_id AS "orgId",
//           username,
//           first_name AS "firstName",
//           last_name AS "lastName",
//           email,
//           schedule,
//           is_enabled AS "isEnabled",
//           image_url AS "imageUrl",
//           author_bio AS "authorBio"
//           FROM agents
//           WHERE agent_id = $1`,[agentId]
//       )
//       const agent = result.rows[0]
//       // console.log("getAgent result:", agent)
//       return agent
//     }

//     static async getOrgAgents(orgId){
//       const result = await db.query(
//         `SELECT 
//         agent_id AS "agentId",
//         org_id AS "orgId",
//         username,
//         first_name AS "firstName",
//         last_name AS "lastName",
//         email,
//         schedule,
//         is_enabled AS "isEnabled",
//         image_url AS "imageUrl",
//         author_bio AS "authorBio"
//         FROM agents
//         WHERE org_id = $1`,[orgId]
//       )
//       return result.rows
//     }
    
//     // Should only be used in development or by super admin. Not by orgs.
//     static async getAllAgents(){
//       const result = await db.query(
//         `SELECT 
//         agent_id AS "agentId",
//         org_id AS "orgId",
//         username,
//         first_name AS "firstName",
//         last_name AS "lastName",
//         email,
//         schedule,
//         is_enabled AS "isEnabled",
//         image_url AS "imageUrl",
//         author_bio AS "authorBio"
//         FROM agents`
//       )
//       return result.rows
//     }

  
// }

// module.exports = Agent;
