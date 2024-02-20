"use strict";

// Routes for the users

const User = require('../models/user') // import blog model from models folder
const express = require('express')
const jsonschema = require('jsonschema')
const registerSchema = require('../schemas/userRegister.json');
const userAuthSchema = require('../schemas/userAuthenticate.json')
const { BadRequestError } = require('openai');
const { createToken } = require('../utilities/jwtoken');

const router = express.Router({ mergeParams: true });



router.post('/login', async function (req,res,next) {
try {
    const validator = jsonschema.validate(req.body, userAuthSchema)
    if(!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs)
    }
    const {username, password} = req.body;
    const user = await User.authenticate(req.body);
    const token = createToken(user)
    return res.json({token})

} catch (error) {
    return next(error)
}

})



/** POST /auth/register
 *  Register a new user.
 * req.body requires userId, title, bodyHtml, bodyPlaintext
 * 
 */

router.post('/register', async function (req,res,next) {
    try {
        // Check for valid schema
        const validator = jsonschema.validate(req.body,registerSchema)
        if(!validator.valid) {
            const errors = validator.errors.map(e => e.stack);
            throw new BadRequestError(errors)
        }

        const newUser = await User.register({...req.body, isAdmin:false})
        console.log(newUser)

        // needs to return a JWT
        const token = createToken(newUser)

        return res.status(201).json(token)
    } catch (error) {
        return next(error)
    }

})


module.exports = router;