import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import models from "../models";
import { NotFoundError, UnauthorizedError } from "../utilities/expressError";
import config from "../config";

const { Account } = models;

class AuthService {
  static async generateToken(accountId: string): Promise<string> {
    const payload: JwtPayload = {
      accountId,
    };
    console.log("AuthService.generateToken. payload and accountId:", payload, accountId);

    return jwt.sign(payload, config.JWT_SECRET, {
      expiresIn: "1d",
      subject: accountId,
    });
  }

  // Used for logging a person in. Accepts email, password. Returns signed JWT.
  static async authenticate({ email, password }): Promise<string> {
    console.log("Inside authenticate function");

    const account = await Account.findOne({ where: { email } });
    if (!account) throw new NotFoundError("Account not found");

    const isValidPassword = await bcrypt.compare(password, account.password);
    if (!isValidPassword) throw new UnauthorizedError("Invalid password");
    console.log("generating token");
    return await this.generateToken(account.accountId);
  }
}
export default AuthService;