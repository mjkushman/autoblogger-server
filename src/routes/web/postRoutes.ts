import { Request, Response, NextFunction, Router } from "express";
import PostService from "../../services/PostService";
import { NotFoundError } from "../../utilities/expressError";
import { Post } from "@/types/Post.type";

const router: Router = Router({ mergeParams: true });

const postRoutes = () => {
  // get all posts
  router.get(
    "/",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { accountId } = res.locals;
        const { agentId } = req.query;

        let options = {
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

  return router;
};

export default postRoutes;
