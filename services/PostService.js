// import the org model

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
    console.log("hit Posts findAll function");
    const posts = await Post.findAll({
      where: { authorId: agentId },
      order: [["updatedAt", "DESC"]],
    });
    const titles = posts.map((post) => post.titlePlaintext);
    return titles;
  }

  /** POST generates a new post */
  static async generate({post}) {
    console.log("Posts: Creating from payload and ORGID:", body, orgId);

    return await Post.create({ post });
  }
}
module.exports = PostService;
