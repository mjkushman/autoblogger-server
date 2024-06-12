// import the org model

const { EndUsers } = require("../models");

class EndUserService {
  /** GET all users */
  async findAll(orgId) {
    console.log("hit findAll Users function");
    return await EndUsers.findAll({ where: { orgId: orgId } });
  }
  async findByUserId(orgId, userId) {
    console.log("hit findByUserId  function");
    return await EndUsers.findByPk(userId, { where: { orgId } });
  }
  async findByUsername(orgId, username) {
    console.log("hit findByUsername function");
    return await EndUsers.findOne({ where: { username, orgId } });
  }

  /** POST creates a new user */
  async create(orgId, payload) {
    console.log("EndUsers: Create");

    console.log(payload);
    // TODO: hash the password
    // let newUser = {...payload,"access_key":"999"}

    // strip password from the payload

    let user = { ...payload, orgId };
    const [result, created] = await EndUsers.findOrCreate({
      where: { email: payload.email, orgId },
      defaults: user,
    });

    if (created) {
      // console.log(result);

      const newUser = (({
        username,
        firstName,
        lastName,
        email,
        role,
        imageUrl,
        orgId,
      }) => ({ username, 
        firstName, 
        lastName, 
        email, 
        role, 
        imageUrl, 
        orgId }))(
        result
      );

      return newUser;
    }
    return "user already exists";
  }
}

module.exports = EndUserService;
