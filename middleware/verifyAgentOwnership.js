// Verifies that an agent in a request body belongs to the account making the request.

const { UnauthorizedError } = require("../utilities/expressError");

module.exports = {
  async verifyAgentOwnership(req, res, next) {
    const { account } = req;
    const { agentId } = req.body;

    const agents = account.Agents || account.agents

    let ownedAgentIds = agents.map((agent) => agent.agentId);
    try {
      console.log(`owned Ids: ${ownedAgentIds}`);
      if (ownedAgentIds.includes(agentId)) return next();
      throw new UnauthorizedError(
        "A valid agentId owned by your account must be provided in the request body."
      );
    } catch (error) {
      next(error);
    }
  },
};
