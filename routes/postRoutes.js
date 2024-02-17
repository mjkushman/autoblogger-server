"use strict";

// Routes for blog posts

const Post = require('../models/post') // import post model from models folder
const Comment = require('../models/comment') // import comment model from models folder
const express = require('express')

const router = express.Router({ mergeParams: true });


/** GET / return all blog articles
 * 
 */

router.get('/', async function (req,res,next) {

    try {
        const result = await Post.getAllPosts();
        return res.json(result)
    } catch (error) {
        return next(error)
    }
}) 

/** GET / return a single blog article with comments
 * 
 */

router.get('/:id', async function (req,res,next) {
    try {
        const result = await Post.getSinglePost(req.params.id);
        return res.json(result)
    } catch (error) {
        return next(error)
    }
}) 


/** POST / Create a new blog post. 
 * req.body requires userId, title, bodyHtml, bodyPlaintext
 * 
 */

router.post('/', async function (req,res,next) {
    try {
        // const {title, bodyPlaintext, bodyHtml} = req.body
        const result = await Post.createNewPost(req.body)

        console.log(result)
        return res.status(201).json({result})
    } catch (error) {
        return next(error)
    }

})

/** POST / Adds a comment to a blog post
 * req.body requires userId and body
 *  URL like
 * .com/posts/:id/comments 
 * .com/posts/3/comments
 */

router.post('/:id/comments', async function (req,res,next) {
    
    try {
        // add a new comment to the post
        const postId = req.params.id
        const newComment = await Comment.addComment(postId, req.body)


        // create an AI's response to the comment
        const aiReply = await Comment.addAiReply(postId)


        console.log(newComment)
        return res.status(201).json({userComment:newComment, aiReply:aiReply})
    } catch (error) {
        return next(error)
    }
})

module.exports = router;