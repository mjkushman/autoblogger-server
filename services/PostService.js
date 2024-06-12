// import the org model

const { Posts } = require("../models");

class PostService {
  /** GET all posts */
  async findAll(orgId) {
    console.log("hit Posts findAll function");
    return await Posts.findAll({where:{orgId}});
  }

  async findOne(postId) {
    console.log("hit Posts findOne  function");
    // TODO: Modify this to return an array of post comments too
    return await Posts.findByPk(postId, { where: { orgId:orgId } });
  }

  /** POST creates a new post */
  async create(payload) {
    console.log("Posts: Creating from payload:", payload);

    return await Posts.create({});
  }
}
module.exports = PostService;
