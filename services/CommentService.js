// import the org model

const { Comment, User, Post, Blog } = require("../models");
const { NotFoundError } = require("../utilities/expressError");
const { accountId } = require("../utilities/IdGenerator");

class CommentService {
  /** GET all comments for the account */
  static async findAll({ accountId, postId }) {
    console.log(
      `hit Comment findAll function for account ${accountId}, postId: ${postId}`
    );
    try {
      if (postId) {
        return await Comment.findAll({ where: { accountId, postId } });
      }
      else return await Comment.findAll({ where: { accountId } });
    } catch (error) {
      throw error;
    }
  }

  // Get a single comment
  static async findOne(commentId) {
    console.log("hit Comment findOne function");
    try {
      const comment = await Comment.findByPk(commentId);
      if (!comment) throw new NotFoundError("Comment not found");
      return comment;
    } catch (error) {
      throw error;
    }
  }

  // Get all comments for one post
  static async findAllByPost({ postId, accountId }) {
    console.log("hit Comment findAllByPost  function");

    try {
      return await Comment.findAll({ where: { postId, accountId } });
    } catch (error) {
      throw error;
    }
  }

  // Get all comments for one blog
  static async findAllByBlog({ blogId, account }) {
    console.log("hit Comment findAllByPost  function");
    const { accountId } = account;
    return await Comment.findAll({ where: { blogId, accountId } });
  }

  /** POST creates a new comment */
  static async create({
    postId,
    content,
    userId,
    accountId,
    parentId,
    agentId,
  }) {
    console.log(`Comment: Creating from 
    POISTID: ${postId} 
    parentId: ${parentId} 
    content: ${content}
    account: ${accountId}
    userId ${userId}`);

    try {
      const comment = await Comment.create({
        parentId,
        accountId,
        postId,
        content,
        userId,
        agentId,
      });
      // get the associated user and post text. Post text is used for reply generation if enabled
      const commentUserPost = await Comment.findOne({
        where: { commentId: comment.commentId },
        include: [
          {
            model: User,
            attributes: ["firstName", "lastName", "username"],
          },
          {
            model: Post,
            attributes: ["titlePlaintext", "bodyPlaintext"],
          },
        ],
      });

      return commentUserPost;
    } catch (error) {
      throw error;
    }
  }
}
module.exports = CommentService;
