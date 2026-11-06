import crypto from "crypto";
import models from "../models";
import { BadRequestError, ExpressError, NotFoundError } from "../utilities/expressError";
import { cache } from "../cache";

const { Account, Agent } = models;

// The only fields an account owner may change. Never accountId or the API key.
const UPDATABLE_FIELDS = ["email", "firstName", "lastName", "password", "imageUrl", "openAiApiKey"];

class AccountService {
  /** The shape sent to the account owner. Never includes the password hash. */
  static toPublic(account) {
    const { password, ...rest } = account.toJSON();
    return rest;
  }

  /** POST creates a new developer account */
  static async create({ body }) {
    const { host, email, firstName, lastName, password } = body;

    const existingAccount = await Account.findOne({ where: { email } });
    if (existingAccount)
      throw new BadRequestError("That email is already in use");

    // Generate a unique api key
    const apiKey = crypto.randomBytes(64).toString("hex");
    const apiKeyIndex = apiKey.substring(0, 9);

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

  /** Finds the account an API key belongs to. Callers must still compare the full key. */
  static async findByApiKeyIndex({ providedApiKey }) {
    const apiKeyIndex = String(providedApiKey.substring(0, 9));
    const result = await Account.findOne({ where: { apiKeyIndex } });
    if (!result) return result;

    // Deliberately no agents: this object is cached, and agents change without the cache knowing
    const { accountId, firstName, lastName, email, apiKey, openAiApiKey } = result;
    return { accountId, firstName, lastName, email, apiKey, openAiApiKey };
  }

  static async findOne(accountId) {
    const account = await Account.findOne({
      where: { accountId },
      include: [Agent],
    });
    if (!account) throw new NotFoundError("Account not found.");
    return AccountService.toPublic(account);
  }

  static async update({ accountId, body }) {
    const account = await Account.findOne({ where: { accountId } });
    if (!account) throw new NotFoundError("Account not found.");

    const changes = Object.fromEntries(
      UPDATABLE_FIELDS.filter((field) => field in body).map((field) => [field, body[field]])
    );
    await account.update(changes); // triggers hooks
    return AccountService.toPublic(account);
  }

  static async destroy(accountId) {
    const account = await Account.findOne({ where: { accountId } });
    if (!account) throw new NotFoundError("Account not found.");

    await account.destroy();
    cache.delete(account.apiKey); // the key must stop working immediately
    return 1;
  }
}

export default AccountService;
