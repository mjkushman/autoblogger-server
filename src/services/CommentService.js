const { Comment, Post } = require("../models");
const { NotFoundError } = require("../utilities/expressError");

class CommentService {
  /** The shape sent to API consumers */
  static toPublic(comment) {
    return {
      commentId: comment.commentId,
      postId: comment.postId,
      parentId: comment.parentId,
      authorName: comment.authorName,
      isAgent: !!comment.agentId,
      content: comment.content,
      createdAt: comment.createdAt,
    };
  }

  /** All comments for the account, oldest first. Pass postId for just one post. */
  static async findAll({ accountId, postId }) {
    return await Comment.findAll({
      where: { accountId, ...(postId && { postId }) },
      order: [["createdAt", "ASC"]],
    });
  }

  static async findOne({ commentId, accountId }) {
    const comment = await Comment.findOne({ where: { commentId, accountId } });
    if (!comment) throw new NotFoundError("Comment not found");
    return comment;
  }

  /** Creates a comment on one of the account's posts. agentId marks an AI reply. */
  static async create({ accountId, postId, authorName, content, parentId, agentId }) {
    const post = await Post.findOne({ where: { postId, accountId } });
    if (!post) throw new NotFoundError("Post not found");
    return await Comment.create({ accountId, postId, authorName, content, parentId, agentId });
  }

  static async destroy({ accountId, commentId }) {
    const result = await Comment.destroy({ where: { accountId, commentId } });
    return result ? "Success" : "Nothing to delete";
  }
}
module.exports = CommentService;
