// import the org model

import crypto from "crypto";
import models from "../models";
import { BadRequestError, ExpressError, NotFoundError } from "../utilities/expressError";
import { cache } from "../cache";

const { Account, Agent } = models;

class AccountService {
  /** POST creates a new developer account, and first user */

  static async create({ body }) {
    console.log(
      "account service: creating a new developer account from body:",
      body
    );

    const { host, email, firstName, lastName, label, password } = body;

    const existingAccount = await Account.findOne({ where: { email } });
    if (existingAccount)
      throw new BadRequestError("That email is already in use");

    // Generate a unique api key
    const apiKey = crypto.randomBytes(64).toString("hex");
    const apiKeyIndex = apiKey.substring(0, 9);

    // create the new account
    try {
      const newAccount = await Account.create({
        email,
        firstName,
        lastName,
        host,
        apiKey,
        apiKeyIndex,
        password,
      });
      console.log("STORED NEW Account");
      console.dir(newAccount);

      // store new account in cache
      const account = {
        accountId: newAccount.accountId,
        firstName: newAccount.firstName,
        lastName: newAccount.lastName,
        email: newAccount.email,
        apiKey,
      };
      cache.set(apiKey, account);
      // TODO: Send email to developer with their api key

      return account;
    } catch (error) {
      throw new ExpressError(error.message, 500);
    }
  }

  static async findByApiKeyIndex({ providedApiKey }) {
    console.log("FINDING BY API KEY INDEX");

    const apiKeyIndex = String(providedApiKey.substring(0, 9));
    console.log("API KEY INDEX:", apiKeyIndex);
    const result = await Account.findOne({
      where: {
        apiKeyIndex,
      },
      include: [Agent],
    });
    console.log("result of find:", result);
    if (result) {
      const {
        accountId,
        firstName,
        lastName,
        email,
        label,
        Agents,
        apiKey,
        openAiApiKey,
      } = result;
      // console.log('RESULT OF APIKEYINDEX LOOKUP:', result)
      // extract agentid and username
      // const agents = result.Agents.map((a) => {
      //   a.agentId, a.username;
      // });
      const account = {
        accountId,
        firstName,
        lastName,
        email,
        label,
        apiKey,
        openAiApiKey,
        Agents,
      };

      // console.log("CONSTRUNCTED ACCOUNT RESPONSE:", account)
      return account;
    }
    return result;
  }

  static async findAll() {
    console.log("account service findall");
    return await Account.findAll();
  }
  static async findOne(accountId) {
    console.log("account service findOne");
    const account = await Account.findOne({
      where: { accountId },
      include: [Agent],
    });
    if (!account) throw new NotFoundError("Account not found.");
    return account;
  }

  static async update({ accountId, body }) {
    console.log("account service update");
    const account = await Account.findOne({
      where: { accountId },
    });
    if (!account) throw new NotFoundError("Account not found.");
    await account.update(body); // triggers hooks
    return account;
  }

  static async destroy(accountId) {
    console.log("deleting account");
    const rowsDeleted = await Account.destroy({
      where: { accountId },
    });

    if (!rowsDeleted) throw new NotFoundError("Account not found.");
    return rowsDeleted; // expect: 1
  }
}

export default AccountService;
