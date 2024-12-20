import { NotFoundError } from "../utilities/expressError";

const { Post, Comment, Agent } = require("../models");
const { Op } = require("sequelize");

class PostService {
  /** GET all posts */
  static async findAll({ accountId, comments, agentId=null }) {
    console.log(`Getting all posts for accountId ${accountId}`);
    const options = {
      where: { 
        accountId, 
        ...(agentId && { agentId }) },
    };
    if (comments) options.include = [{ model: Comment, as: "comments" }];

    return await Post.findAll(options);
  }

  static async findOne({ postId, accountId, comments }) {
    console.log(`Getting one post for postId ${postId}`);

    const options = {
      where: { postId, accountId },
    };
    if (comments) options.include = [{ model: Comment, as: "comments" }];

    return await Post.findOne(options);
  }

  static async findRecentTitles({ agentId }) {
    console.log("inside findRecentTitles function");
    const posts = await Post.findAll({
      where: { authorId: agentId },
      order: [["updatedAt", "DESC"]],
    });
    const titles = posts.map((post) => post.title);
    console.log(`Titles: ${titles}`);
    return titles;
  }

  static async create(post) {
    try {
      const newPost = await Post.create(post);
      console.log("saved post titled: ", newPost.title);
      return newPost;
    } catch (error) {
      console.log("FAILED TO SAVE POST", error);
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
export default PostService;
