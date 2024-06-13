// import the org model

const { EndUser } = require("../models");

class EndUserService {
  /** GET all users */
  async findAll(orgId) {
    console.log("hit findAll Users function");
    return await EndUser.findAll({ where: { orgId: orgId } });
  }
  async findByUserId(orgId, userId) {
    console.log("hit findByUserId  function");
    return await EndUser.findByPk(userId, { where: { orgId } });
  }
  async findByUsername(orgId, username) {
    console.log("hit findByUsername function");
    return await EndUser.findOne({ where: { username, orgId } });
  }

  /** POST creates a new user */
  async create(orgId, payload) {
    console.log("EndUsers: Create");
    console.log('CREATING ENDUSER:',payload)

    // Add orgId to the payload

    const [result, created] = await EndUser.findOrCreate({
      where: { email: payload.email, orgId },
      defaults: payload,
    });

    if (created) {
      // strip sensitive fields from the return
      console.log('CREATED USER, BEFORE PRUNING PW:',result)
      const newUser = (({
        username,
        firstName,
        lastName,
        email,
        role,
        imageUrl,
        orgId,
      }) => ({ username, firstName, lastName, email, role, imageUrl, orgId }))(
        result
      );
      return newUser;
    }
    return "user already exists";
  }
}

module.exports = EndUserService;
