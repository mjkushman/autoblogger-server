const { Post, Comment, Agent } = require("../models");
const { Op } = require("sequelize");

class PostService {
  /** GET all posts */
  static async findAll(blogIds) {
    console.log(`Getting all posts for blogIds ${blogIds}`);
    return await Post.findAll({
      where: { blogId: { [Op.or]: blogIds } },
    });
  }

  static async findOne({ postId, blogIds }) {
    console.log(`Getting one post for postId ${postId} and blogIds ${blogIds}`);
    return await Post.findOne({
      where: { postId, blogId: { [Op.or]: blogIds } },
      include: {
        model: Comment,
      },
    });
  }

  static async findRecentTitles({ agentId }) {
    console.log("inside findRecentTitles function");
    const posts = await Post.findAll({
      where: { authorId: agentId },
      order: [["updatedAt", "DESC"]],
    });
    const titles = posts.map((post) => post.titlePlaintext);
    console.log(`Titles: ${titles}`);
    return titles;
  }

  static async create(post) {
    console.log("PostService: creating saving post:", post.titlePlaintext);
    try {
      console.log("Attempting to save: ", post.titlePlaintext);
      const newPost = await Post.create(post);
      console.log("saved post titled: ", newPost.titlePlaintext);
      return newPost;
    } catch (error) {
      console.log('FAILED TO SAVE POST', error)
      throw new Error(error);
    }
  }

  static async delete({ postId, accountId }) {
    console.log(
      `service: deactivating and deleting post ${postId} for account: ${accountId}`
    );
    try {
      let result = await Post.destroy({ where: { postId, accountId } });
      if (result > 0) {
        return { message: "Delete successful" };
      } else {
        throw new NotFoundError(
          `Post ${postId} for account ${accountId} not found.`
        );
      }
    } catch (error) {
      throw error;
    }
  }
}
module.exports = PostService;
