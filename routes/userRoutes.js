"use strict";

// Routes for the users

const User = require('../models/user') // import blog model from models folder
const express = require('express')

const router = express.Router({ mergeParams: true });


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


/** POST / Create a new blog post. 
 * req.body requires userId, title, bodyHtml, bodyPlaintext
 * 
 */

// router.post('/', async function (req,res,next) {
//     try {
//         // const {title, bodyPlaintext, bodyHtml} = req.body
//         const result = await Post.createNewPost(req.body)

//         console.log(result)
//         return res.status(201).json({result})
//     } catch (error) {
//         return next(error)
//     }

// })

/** POST / Adds a comment to a blog post
 * req.body requires userId and body
 * 
 */

// router.post('/:id/comments', async function (req,res,next) {
    
//     try {
//         const postId = req.params.id
//         const result = await Post.addComment(postId, req.body)

//         console.log(result)
//         return res.status(201).json({result})
//     } catch (error) {
//         return next(error)
//     }

// })


module.exports = router;