"use string"


const Org = require('./orgModel')
const express = require("express")
const router = express.Router({mergeParams:true})
const jsonschema = require('jsonschema')
const createOrgSchema = require('./createOrgSchema')
const { BadRequestError } = require('openai')


// Get all orgs or a single org
router.get('/', async function(req,res,next) {
    
    const orgId = req.query.orgId
    try {
        let result
        // Determine if it should return one or all orgs
        if(orgId){
        result = await Org.getOrg(orgId)
        } else{
        result = await Org.getAllOrgs()
        }
        return res.json({organizations:result})
    } catch (error) {
     console.log(`Error getting all orgs: ${error}`)  
        return(res.json({error:error}))
    }
})


// Create an org
router.post('/', async function(req,res,next) {
    try {
        
        const validator = jsonschema.validate(req.body,createOrgSchema)

        if(!validator.valid){
        const errors = validator.errors.map((e) => e.stack);
            let status = new BadRequestError("You can't do that")
          return(res.status(400).json({status,errors:errors}))
        }
        const {name,contactEmail,plan} = req.body

        const result = await Org.createOrg(name,contactEmail,plan)
        return res.status(201).json({org:result})
    } catch (error) {
        console.log(`Error creating a new org: ${error}`) 
        return json({message:"Something messed up"})
    }
})

module.exports = router