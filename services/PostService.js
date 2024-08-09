// import the org model

const { Post, Comment } = require("../models");
const { Op } = require("sequelize");

class PostService {
  /** GET all posts */
  static async findAll(blogIds) {
    console.log("hit Posts findAll function");
    return await Post.findAll({
      where: { blogId: { [Op.or]: blogIds } },
    });
  }

  static async findOne({ postId, blogIds }) {
    console.log("hit Posts findOne  function");
    return await Post.findOne({
      where: { postId, blogId: { [Op.or]: blogIds } },
      include: {
        model: Comment,
      },
    });
  }

  static async findRecentTitles({ agentId }) {
    console.log("hit Posts findAll function");
    const posts = await Post.findAll({
      where: { authorId: agentId },
      order: [["updatedAt", "DESC"]],
    });
    const titles = posts.map((post) => post.titlePlaintext);
    return titles;
  }

  /** POST creates a new post */
  static async create(body, orgId) {
    console.log("Posts: Creating from payload and ORGID:", body, orgId);

    return await Post.create({ ...body, orgId });
  }
}
module.exports = PostService;
