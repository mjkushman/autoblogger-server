// import the org model

const { Comment } = require("../models");

class CommentService {
  /** GET all comments for the org */
  async findAll(orgId) {
    console.log("hit Comment findAll function");
    return await Comment.findAll({where:{orgId}});
  }

  // Get a single comment
  async findOne(commentId) {
    console.log("hit Comment findOne  function");
    
    return await Comment.findOne({ where: { commentId:commentId } });
  }
  
  // Get all comments for one post
  async findAllByPost({postId, orgId}) {
    console.log("hit Comment findAllByPost  function");

    return await Comment.findAll({ where: { postId, orgId } })
    ;
  }

  /** POST creates a new comment */
  async create({content, orgId, postId, userId, agentId}) {
    console.log(`Comment: Creating from 
    POISTID: ${postId} 
    orgId ${orgId} 
    content: ${content}
    userId ${userId}
    agentId ${agentId}`);

    return await Comment.create({content,postId, userId, orgId} );
  }
}
module.exports = CommentService;
