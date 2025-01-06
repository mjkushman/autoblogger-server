import { Request, Response, NextFunction, Router } from "express";
import PostService from "../../services/PostService";
import { NotFoundError } from "../../utilities/expressError";
import { Post } from "@/types/Post.type";
const AgentService = require("../../services/AgentService");

const router: Router = Router({ mergeParams: true });

const postRoutes = () => {
  // get all posts
  router.get(
    "/",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { accountId } = res.locals;
        const { agentId } = req.query;

        const options = {
          accountId,
          agentId,
          comments: false,
        };

        const posts: Post[] | null = await PostService.findAll(options);
        // console.log('POSTS', posts)
        res.send({
          status: 200,
          data: posts,
        });
      } catch (error) {
        next(error);
      }
    }
  );

  // get one post
  router.get(
    "/:postId",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { postId } = req.params;
        const { accountId } = res.locals;
        const post: Post | null = await PostService.findOne({
          postId,
          accountId,
          comments: false,
        });
        if (!post) throw new NotFoundError("Post not found");
        res.send({ status: 200, data: post });
      } catch (error) {
        next(error);
      }
    }
  );
  // generate a new post
  router.post(
    "/",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { agentId } = req.body;
        const generatedPost = await AgentService.writePost({
          agentId,
        });
        await PostService.create(generatedPost); // save the newly written post
        res.send({
          status: 200,
          data: "Generating new post",
          message: "Generating post",
        });
      } catch (error) {
        next(error);
      }
    }
  );
  // Delete a post by id
  router.delete(
    "/:postId",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { accountId } = res.locals;
        const { postId } = req.params || req.body; // provide in either
        const result = await PostService.delete({ accountId, postId });
        res.send({ status: 200, data: result });
      } catch (error) {
        next(error);
      }
    }
  );

  return router;
};

export default postRoutes;
