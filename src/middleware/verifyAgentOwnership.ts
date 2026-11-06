// Verifies that an agent in a request body belongs to the account making the request.

import { NextFunction, Response, Request } from "express";
import models from "../models";
import { UnauthorizedError } from "../utilities/expressError";

const { Agent } = models;

async function verifyAgentOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { accountId } = res.locals.account;
    const { agentId } = req.body;

    // Checked against the database, not the cached account, which can be out of date
    const agent = agentId && (await Agent.findOne({ where: { agentId, accountId } }));
    if (!agent) {
      throw new UnauthorizedError(
        "A valid agentId owned by your account must be provided in the request body."
      );
    }
    return next();
  } catch (error) {
    next(error);
  }
}
export default verifyAgentOwnership;
