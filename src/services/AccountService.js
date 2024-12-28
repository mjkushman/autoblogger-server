// import the org model

const { Account, Agent } = require("../models");
const { ExpressError, NotFoundError } = require("../utilities/expressError");
const crypto = require("crypto");
const { cache } = require("../cache");

class AccountService {
  /** POST creates a new developer account, and first user */

  static async create({ body }) {
    console.log(
      "account service: creating a new developer account from body:",
      body
    );

    const { host, email, firstName, lastName, label, password } = body;

    const existingAccount = await Account.findOne({ where: { email } });
    if (existingAccount) return new ExpressError("That email is already in use", 400);

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
      throw new ExpressError(error, 500);
    }
  }

  static async findByApiKeyIndex({ apiKey }) {
    console.log("FINDING BY API KEY INDEX");

    const apiKeyIndex = apiKey.substring(0, 9);
    console.log("API KEY INDEX:", apiKeyIndex);
    const result = await Account.findOne({
      where: {
        apiKeyIndex,
      },
      include: [Agent],
    });
    if (result) {
      const { accountId, firstName, lastName, email, label, Agents, openAiApiKey } =
        result;
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
    try {
      console.log("trying");
      const accounts = await Account.findAll();
      return accounts;
    } catch (error) {
      console.log("catching");
      return error;
    }
  }
  static async findOne(accountId) {
    console.log("account service findOne");
    try {
      console.log("trying accountService findOne");
      const account = await Account.findOne({
        where: { accountId },
        include: [Agent]
      });
      if (!account) throw new NotFoundError("Account not found.");
      return account;
    } catch (error) {
      console.log("catching");
      throw new Error(error);
    }
  }
  
  static async update({accountId, body}) {
    console.log("account service update");
    try {
      console.log("trying");
      const account = await Account.findOne({
        where: { accountId }
      });
      if (!account) throw new NotFoundError("Account not found.");
      console.log("Attempting account update with body: ", body);
      await account.update(body);
      await account.save(); // triggers hooks
      return account;
    } catch (error) {
      console.log("catching");
      throw new Error(error);
    }
  }


  static async destroy(accountId) {
    console.log("deleting account");
    try {
      console.log("trying");
      const rowsDeleted = await Account.destroy({
        where: { accountId }
      });
      
      if (!rowsDeleted) throw new Error(`Deleted ${rowsDeleted} rows`);
      return rowsDeleted; // expect: 1
    } catch (error) {
      console.log("catching");
      throw new Error(error);
    }
  }
}

module.exports = AccountService;
