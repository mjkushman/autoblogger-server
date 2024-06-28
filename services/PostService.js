// import the org model

const { Post, Comment } = require("../models");

class PostService {
  /** GET all posts */
  async findAll(orgId) {
    console.log("hit Posts findAll function");
    return await Post.findAll({ where: { orgId } });
  }

  async findOne({ postId, orgId }) {
    console.log("hit Posts findOne  function");
    return await Post.findOne({
      where: { postId, orgId },
      include: {
        model: Comment,
      },
    });
  }

  /** POST creates a new post */
  async create(payload, orgId) {
    console.log("Posts: Creating from payload and ORGID:", payload, orgId);

    return await Post.create({ ...payload, orgId });
  }
}
module.exports = PostService;
