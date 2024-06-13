"use string";

// const Org = require('../orgs/orgModel')
const express = require("express");
const router = express.Router({ mergeParams: true });
const jsonschema = require("jsonschema");
const createOrgSchema = require("../schemas/createOrgSchema");
// const { BadRequestError } = require('openai')

// ====== NEW SEQUELIZE SERVICE HERE
// Receives config from routes/index.js
module.exports = (config) => {
  const OrgService = require("../services/OrgService");
  const orgService = new OrgService(config.database.client);
  // ====== END NEW SEQUELIZE SERVICE

  // Get all orgs
  router.get("/", async function (req, res, next) {
    // const orgId = req.query.orgId

    const orgs = await orgService.findAll();
    return res.json({ orgs });

  });
  // Get a single org
  router.get("/:orgId", async function (req, res, next) {
    
    const org = await orgService.findOne(req.params.orgId);
    return res.json({ org });

  });

  // Create an org
  router.post("/", async function (req, res, next) {
    const payload = req.body;
    console.log("PAYLOAD (req.body)", payload);
    let data = await orgService.create(payload);
    return res.json({ data });

    // BEFORE SEQUELIZE:
    // try {

    //     const validator = jsonschema.validate(req.body,createOrgSchema)

    //     if(!validator.valid){
    //     const errors = validator.errors.map((e) => e.stack);
    //         let status = new BadRequestError("You can't do that")
    //       return(res.status(400).json({status,errors:errors}))
    //     }
    //     const {name,contactEmail,plan} = req.body

    //     const result = await Org.createOrg(name,contactEmail,plan)
    //     return res.status(201).json({org:result})
    // } catch (error) {
    //     console.log(`Error creating a new org: ${error}`)
    //     return json({message:"Something messed up"})
    // }
  });
  return router;
};