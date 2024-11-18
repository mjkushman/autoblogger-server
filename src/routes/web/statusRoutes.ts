import {
  Request,
  Response,
  NextFunction,
  Router,
  RouterOptions,
} from "express";
const StatusService = require("../../services/StatusService");
const { NotFoundError } = require("../../utilities/expressError");

const router: Router = Router({ mergeParams: true });

export default (config) => {
  // Define response type
  type StatusResponse = {
    status: number;
    data: any | null;
    message: string;
  };

  // Properly typed route
  router.get(
    "/",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        res.send({
          status: 200,
          data: null,
          message: "Provide a status ID to check the status",
        });
      } catch (error) {
        next(error);
      }
    }
  );

  router.get(
    "/:statusId",
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      // get a status
      try {
        const { statusId } = req.params;
        const status = await StatusService.findOne(statusId);
        if (!status) throw new NotFoundError("Item not found");
        res.send({ status: 200, data: status });
      } catch (error) {
        return next(error);
      }
    }
  );

  return router;
};
