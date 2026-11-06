// Runs once per test file, after jest is ready.
import { resetMocks } from "./mocks";

// Keep the output readable: the server logs a lot, and morgan writes straight to stdout.
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "dir").mockImplementation(() => {});
jest.mock("morgan", () => () => (_req, _res, next) => next());

jest.mock("openai", () => {
  const m = require("./mocks");
  return {
    __esModule: true,
    default: function (opts) {
      m.mockOpenAIConstructor(opts);
      return { chat: { completions: { create: m.mockOpenAICreate } } };
    },
  };
});

jest.mock("@anthropic-ai/sdk", () => {
  const m = require("./mocks");
  return {
    __esModule: true,
    default: function (opts) {
      m.mockAnthropicConstructor(opts);
      return { messages: { create: m.mockAnthropicCreate } };
    },
  };
});

jest.mock("axios", () => {
  const m = require("./mocks");
  return { __esModule: true, default: { get: m.mockAxiosGet } };
});

// Only schedule() is faked. validate() stays real because cronEncoder and the Agent model rely on it.
jest.mock("node-cron", () => {
  const m = require("./mocks");
  const actual = jest.requireActual("node-cron");
  const real = actual.default ?? actual;
  const cron = { ...real, schedule: m.mockCronSchedule };
  return { __esModule: true, ...cron, default: cron };
});

beforeEach(resetMocks);
