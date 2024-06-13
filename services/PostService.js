// import the org model

const { Post } = require("../models");

class PostService {
  /** GET all posts */
  async findAll(orgId) {
    console.log("hit Posts findAll function");
    return await Posts.findAll({where:{orgId}});
  }

  async findOne(postId) {
    console.log("hit Posts findOne  function");
    // TODO: Modify this to return an array of post comments too
    return await Post.findByPk(postId, { where: { orgId:orgId } });
  }

  /** POST creates a new post */
  async create(payload, orgId) {
    console.log("Posts: Creating from payload and ORGID:", payload, orgId);

    return await Post.create({...payload, orgId });
  }
}
module.exports = PostService;
