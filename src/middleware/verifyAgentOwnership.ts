// Verifies that an agent in a request body belongs to the account making the request.

import { NextFunction, Response, Request } from "express";

import { UnauthorizedError } from "../utilities/expressError";


async function verifyAgentOwnership(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { account } = res.locals;
  const { agentId } = req.body;

  const agents = account.Agents || account.agents;

  const ownedAgentIds = agents.map((agent) => agent.agentId);
  try {
    console.log(`owned Ids: ${ownedAgentIds}`);
    if (ownedAgentIds.includes(agentId)) return next();
    throw new UnauthorizedError(
      "A valid agentId owned by your account must be provided in the request body."
    );
  } catch (error) {
    next(error);
  }
}
export default verifyAgentOwnership;
