import { Request, Response, NextFunction } from "express";

const responseHandler = (_req: Request, res: Response, next: NextFunction) => {
  res.sendResponse = ({ data, status = 200, message = "Success" }) => {
    res.status(status).json({ status, message, data });
  };

  next();
};

export default responseHandler;
