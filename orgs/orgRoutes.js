"use string"


const Org = require('./orgModel')
const express = require("express")
const router = express.Router({mergeParams:true})


// Get all orgs or a single org
router.get('/', async function(req,res,next) {
    
    const orgId = req.query.orgId
    
    try {
        let result
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
        const {name,contactEmail,plan} = req.params
        const result = await Org.createOrg(name,contactEmail,plan)
        return res.setMaxListeners(201).json({org:result})
    } catch (error) {
        console.log(`Error creating a new org: ${error}`) 
        return json({message:"Something messed up"})
    }
})

module.exports = router