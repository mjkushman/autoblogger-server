"use strict";

// Routes for the users

const User = require('../models/user') // import blog model from models folder
const express = require('express')
const router = express.Router({ mergeParams: true });

const userUpdateSchema = require('../schemas/userUpdate.json');
const { BadRequestError } = require('openai');
const jsonschema = require('jsonschema');
const { updateUserSql } = require('../utilities/sqlMapper');


/** GET / return all users
 * 
 */

router.get('/', async function (req,res,next) {

    try {
        const result = await User.getAllUsers();
        return res.json(result)
    } catch (error) {
        return next(error)
    }
}) 


/** GET / return a single user and all posts and comments written by that user
 * 
 */

router.get('/:username', async function (req,res,next) {
    try {
        const result = await User.getUser(req.params.username);
        return res.json(result)
    } catch (error) {
        return next(error)
    }
}) 



/** PATCH / Update information about a user
 * User may udpate themselves. Admin may update anyone
 * Correct password required for any update
 * All other fields options.
 * Must only update fields that have changes
 */
router.patch('/:id', async function (req,res,next) {
    try {
        const validator = jsonschema.validate(req.body, userUpdateSchema)
        if(!validator.valid) {
            const errors = validator.errors.map(e => e.stack);
            throw new BadRequestError(errors)
        }
        const userId = req.params.id
        const user = await User.getUserById(userId)

        
        console.log('patch received:',req.body)

        // get the columns to update and their values
        let {updateCols, updateVals} = updateUserSql(req.body)

        const result = await User.updateUser(userId, updateCols, updateVals)

        return res.status(200).json({result})

    } catch (error) {
        return next(error)   
    }
});



module.exports = router;