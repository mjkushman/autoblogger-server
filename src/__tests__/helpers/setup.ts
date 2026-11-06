// Runs once per test file, after jest is ready.
import { resetMocks } from "./mocks";

// Keep the output readable: the server logs a lot, and morgan writes straight to stdout.
jest.spyOn(console, "log").mockImplementation(() => {});
jest.spyOn(console, "error").mockImplementation(() => {});
jest.spyOn(console, "dir").mockImplementation(() => {});
jest.mock("morgan", () => () => (_req, _res, next) => next());

// The LangChain chat models are faked. Each fake turns what LangChain would send into the arguments the
// provider's own SDK takes (mockOpenAICreate / mockAnthropicCreate), so tests can check the real request
// and script the provider's reply in the provider's own shape.
const fakeChatModel = (jest: any, name: string, send: (opts, messages, structured) => Promise<string>) =>
  class {
    opts: any;
    constructor(opts) {
      require("./mocks")[`mock${name}Constructor`](opts);
      this.opts = opts;
    }
    async invoke(messages) {
      return { text: await send(this.opts, messages, false) };
    }
    withStructuredOutput(schema, options) {
      // The real ChatAnthropic refuses this combination
      if (name === "Anthropic" && options.strict) throw new Error("Argument `strict` is only supported for `method` = \"functionCalling\" on Anthropic models.");
      return { invoke: async (messages) => JSON.parse(await send(this.opts, messages, { schema, options })) };
    }
  };

const asRole = (message) => (message.type === "human" ? "user" : message.type === "ai" ? "assistant" : message.type);

jest.mock("@langchain/openai", () => ({
  ChatOpenAI: fakeChatModel(jest, "OpenAI", async (opts, messages, structured) => {
    const reply = await require("./mocks").mockOpenAICreate({
      model: opts.model,
      messages: messages.map((m) => ({ role: asRole(m), content: m.content })),
      ...(structured && { response_format: { type: "json_schema", json_schema: { name: structured.options.name, schema: structured.schema } } }),
    });
    return reply.choices[0].message.content;
  }),
}));

jest.mock("@langchain/anthropic", () => ({
  ChatAnthropic: fakeChatModel(jest, "Anthropic", async (opts, messages, structured) => {
    const reply = await require("./mocks").mockAnthropicCreate({
      model: opts.model,
      max_tokens: opts.maxTokens,
      system: messages.filter((m) => m.type === "system").map((m) => m.content).join("\n"),
      messages: messages.filter((m) => m.type !== "system").map((m) => ({ role: asRole(m), content: m.content })),
      ...(structured && { output_config: { format: { type: "json_schema", schema: structured.schema } } }),
    });
    return reply.content.find((block) => block.type === "text")?.text;
  }),
}));

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
