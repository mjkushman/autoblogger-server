

const { Post, Comment } = require("../models");
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
    console.log(`Titles: ${titles}`)
    return titles;
  }

  static async create(post) {
    try {
      const newPost = await Post.create(post)
      return newPost
    } catch (error) {
      throw new Error(error)
    }
  } 
}
module.exports = PostService;
