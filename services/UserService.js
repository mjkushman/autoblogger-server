// import the org model

const { ValidationError } = require("sequelize");
const { User, Post } = require("../models");

class UserService {
  /** GET all users */
  static async findAll({ orgId }) {
    console.log("hit findAll Users function");
    if (orgId) return await User.findAll({ where: { orgId } });
    else return await User.findAll();
  }

  static async findOneByUserId({ orgId, userId }) {
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
  static async findByUsername({ orgId, username }) {
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
  static async create(payload) {
    console.log("EndUsers: Create");
    console.log("CREATING ENDUSER:", payload);

    const {
      email,
      blogId,
      orgId,
      firstName,
      lastName,
      role,
      password,
      username,
    } = payload;
    console.log('RECEIVED USER CREATE PAYLOAD: ', payload)
    try {
      const user = await User.create({
        email,
        blogId,
        orgId,
        firstName,
        lastName,
        role,
        password,
        username,
      });
      console.log("CREATED USER, BEFORE PRUNING PW:", user);

      const newUser = (({
        orgId,
        blogId,
        firstName,
        lastName,
        username,
        email,
        role,
        imageUrl,
      }) => ({ blogId, username, firstName, lastName, email, role, imageUrl, orgId }))(
        user
      );

      return newUser ;
    } catch (error) {
      return new ValidationError("user already exists", error); // should throw an error here instead
    }
  }
}

module.exports = UserService;
