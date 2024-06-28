// import the org model

const { User, Post } = require("../models");

class UserService {
  /** GET all users */
  async findAll({orgId}) {
    console.log("hit findAll Users function");
    return await User.findAll({ where: { orgId } });
  }
  async findOneByUserId({orgId, userId}) {
    console.log(`hit findOneByUserId function. OrgId: ${orgId}, userId: ${userId}`);
    return await User.findOne({ 
      where: { orgId, userId },
      include: {
        model: Post}
     });
  }
  async findByUsername(orgId, username) {
    console.log("hit findByUsername function");
    return await User.findOne({ where: { username, orgId } });
  }

  /** POST creates a new user */
  async create({orgId, payload}) {
    console.log("EndUsers: Create");
    console.log('CREATING ENDUSER:',payload)

    // Add orgId to the payload

    const [result, created] = await User.findOrCreate({
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

module.exports = UserService;
