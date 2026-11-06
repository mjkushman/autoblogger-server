import { Request, Response, NextFunction } from "express";
import {
  UniqueConstraintError,
  ValidationError,
  ForeignKeyConstraintError,
} from "sequelize";
import {
  ExpressError,
  NotFoundError,
  UnauthorizedError,
  BadRequestError,
  ForbiddenError,
} from "../utilities/expressError";

const errorHandler = (err, req: Request, res: Response, _next: NextFunction) => {
  console.log(`Error on request to ${req.url}`);
  console.log(`Middleware caught this error: ${err}`);

  console.error(err.stack); // Logs the error stack for debugging

  if (err instanceof ForeignKeyConstraintError) {
    // Handle Sequelize Foreign key constraint error
    return res.status(409).json({
      status: "Error",
      message: "Please check the request paremeters.",
    });
  }
  if (err instanceof UniqueConstraintError) {
    // Handle Sequelize unique constraint error
    return res.status(409).json({
      status: "Error",
      message: err.message,
    });
  }
  if (err instanceof ValidationError) {
    // Handle Sequelize validation error
    return res.status(401).json({
      status: "Error",
      message: err.message,
    });
  }
  // Our own errors (400, 401, 403, 404) carry their status
  if (
    err instanceof BadRequestError ||
    err instanceof UnauthorizedError ||
    err instanceof ForbiddenError ||
    err instanceof NotFoundError ||
    err instanceof ExpressError
  ) {
    return res.status(err.status).json({
      status: "Error",
      message: err.message,
    });
  }

  // Handle other errors
  res.status(500).json({
    message: "An internal server error occurred.",
  });
};

export default errorHandler;
