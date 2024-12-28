const { Account } = require("../models");
const {
  NotFoundError,
  UnauthorizedError,
} = require("../utilities/expressError");
import bcrypt from "bcrypt";
import jwt, { Jwt, JwtPayload } from "jsonwebtoken";

import config from "../config";

class AuthService {
  static async generateToken(accountId: string): Promise<string> {
    const payload: JwtPayload = {
      accountId,
    };
    console.log("AuthService.generateToken. payload and accountId:", payload, accountId);

    return jwt.sign(payload, config.SECRET_KEY, {
      expiresIn: "1d",
      subject: accountId,
    });
  }

  // Used for logging a person in. Accepts email, password. Returns signed JWT.
  static async authenticate({ email, password }): Promise<string> {
    console.log("Inside authenticate function");

    const account = await Account.findOne({ where: { email } });
    if (!account) return new NotFoundError("Account not found");

    const isValidPassword = bcrypt.compare(password, account.password);
    if (!isValidPassword) return new UnauthorizedError("Invalid password");
    console.log("generating token");
    return await this.generateToken(account.accountId);
  }
}
export default AuthService;