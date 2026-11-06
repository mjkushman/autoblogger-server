// Real Postgres test database, plus small factories for the records tests need.
import request from "supertest";
import models, { ready } from "../../models";
import createApp from "../../app";
import config from "../../config";
import AccountService from "../../services/AccountService";
import AuthService from "../../services/AuthService";
import { cache } from "../../cache";

export const { Account, Agent, Post, Comment, Status } = models;

/** Call in beforeAll: waits for the connection and starts from empty tables */
export const initDb = async () => {
  await ready;
  await models.sequelize.sync({ force: true });
};

/** Call in beforeEach: empties every table and the API key cache */
export const resetDb = async () => {
  await models.sequelize.truncate({ cascade: true });
  cache.clear();
};

/** Call in afterAll */
export const closeDb = () => models.sequelize.close();

/** supertest client for a fresh app. Create one per test file. */
export const makeClient = () => request(createApp(config));

let counter = 0;
const unique = () => `${Date.now()}${counter++}`;

/** Creates an account, with the API key and JWT you need to call the API as it */
export const createAccount = async (overrides: Record<string, any> = {}) => {
  const account = await AccountService.create({
    body: {
      email: `user${unique()}@test.com`,
      firstName: "Test",
      lastName: "User",
      password: "password123",
      host: "https://example.test",
      ...overrides,
    },
  });
  const token = await AuthService.generateToken(account.accountId);
  return {
    account,
    accountId: account.accountId,
    apiKey: account.apiKey,
    token,
    apiHeaders: { "X-API-KEY": account.apiKey },
    bearer: { Authorization: `Bearer ${token}` },
  };
};

/** A request body that creates a valid agent (disabled, so no cron task is set up) */
export const agentBody = (overrides: Record<string, any> = {}) => ({
  username: `pawla${unique()}`,
  firstName: "Pawla",
  lastName: "Barker",
  email: "pawla@test.com",
  llm: { model: "gpt-5.4-mini", apiKey: "sk-agent-secret" },
  postSettings: {
    isEnabled: false,
    maxWords: 500,
    time: "09:30",
    daysOfWeek: ["mon", "wed"],
    timezone: "America/New_York",
    personality: "cheerful and curious",
    bannedTopics: ["cats"],
  },
  commentSettings: { isEnabled: false, maxWords: 50 },
  ...overrides,
});

/** Saves an agent straight to the database (skips the service and its scheduling) */
export const createAgent = async (accountId: string, overrides: Record<string, any> = {}) => {
  const body: any = agentBody(overrides);
  body.postSettings = { cronSchedule: "30 9 * * mon,wed", ...body.postSettings };
  return Agent.create({ ...body, accountId });
};

export const createPost = async (accountId: string, agentId: string, overrides: Record<string, any> = {}) =>
  Post.create({
    accountId,
    agentId,
    authorId: agentId,
    title: `Post ${unique()}`,
    content: "Post body.",
    ...overrides,
  });

/** Background work (post generation, comment replies) reports on a Status row. Waits until it finishes. */
export const waitForStatus = async (statusId: string, timeoutMs = 3000) => {
  const start = Date.now();
  for (;;) {
    const status: any = await Status.findByPk(statusId);
    if (status && (status.status === "success" || status.status === "error")) return status;
    if (Date.now() - start > timeoutMs) throw new Error(`Status ${statusId} still ${status?.status}`);
    await new Promise((r) => setTimeout(r, 25));
  }
};
