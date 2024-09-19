const { Account } = require("../models");
const {
  NotFoundError,
  UnauthorizedError,
} = require("../utilities/expressError");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config")[process.env.NODE_ENV];

class AuthService {
  // Accepts email, password. Returns signed JWT.
  static async authenticate({ email, password }) {
    console.log("Inside authenticate function");

    const account = await Account.findOne({ where: { email } });
    if (!account) return new NotFoundError("Account not found");

    const isValidPassword = bcrypt.compare(password, account.password);
    if (!isValidPassword) return new UnauthorizedError("Invalid password");

    const payload = {
      email: account.email,
      firstName: account.firstName,
      lastName: account.lastName,
      blogs: await account.Blogs?.map(({ blogId, label }) => ({
        blogId,
        label,
      })),
    };
    return jwt.sign(
      payload,
      SECRET_KEY,
      { expiresIn: "1d" }
    );
    
  }
}

module.exports = AuthService;
