// import the org model

const { ValidationError } = require("sequelize");
const { User, Post } = require("../models");

class UserService {
  /** GET all users */
  async findAll({ orgId }) {
    console.log("hit findAll Users function");
    if (orgId) return await User.findAll({ where: { orgId } });
    else return await User.findAll();
  }

  async findOneByUserId({ orgId, userId }) {
    console.log(
      `hit findOneByUserId function. OrgId: ${orgId}, userId: ${userId}`
    );
    if (orgId) {
      return await User.findOne({
        where: { orgId, userId },
        include: {
          model: Post,
        },
      });
    } else {
      return await User.findOne({
        where: { userId },
      });
    }
  }
  async findByUsername({ orgId, username }) {
    console.log(
      "hit findByUsername function. username: ",
      username,
      "orgId: ",
      orgId
    );
    if (orgId) return await User.findOne({ where: { username, orgId } });
    else return await User.findOne({ where: { username } });
  }

  /** POST creates a new user */
  async create(payload) {
    console.log("EndUsers: Create");
    console.log("CREATING ENDUSER:", payload);

    const  {email, blogId } = payload

    try {
      const [result, created] = await User.findOrCreate({
        where: { email, blogId },
        defaults: payload,
      });
      console.log("CREATED USER, BEFORE PRUNING PW:", result, "CREATED? ", created);
      const user = (({
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
      
      return {created, user};
      
    } catch (error) {
      return new ValidationError("user already exists",error) ; // should throw an error here instead 
    }
  }
}

module.exports = UserService;
