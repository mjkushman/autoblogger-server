// The models an agent can be set to. The client keeps a matching list in
// autoblogger-client/src/app/fixtures/llmModels.ts. Keep the two in sync.
const MODELS = [
  { model: "gpt-5.4-mini", label: "GPT-5.4 mini", provider: "openai" },
  { model: "gpt-5.4", label: "GPT-5.4", provider: "openai" },
  { model: "gpt-5.5", label: "GPT-5.5", provider: "openai" },
  { model: "claude-haiku-5-5", label: "Claude Haiku 5.5", provider: "anthropic" },
  { model: "claude-sonnet-5-5", label: "Claude Sonnet 5.5", provider: "anthropic" },
  { model: "claude-opus-5-5", label: "Claude Opus 5.5", provider: "anthropic" },
];

const DEFAULT_MODEL = "gpt-5.4-mini";

// Agents saved before models were selectable stored a provider name instead.
const LEGACY_MODELS = { chatgpt: DEFAULT_MODEL, claude: "claude-sonnet-5-5" };

const resolveModel = (model) => LEGACY_MODELS[model] ?? model;

const isValidModel = (model) =>
  MODELS.some((m) => m.model === resolveModel(model));

const getProvider = (model) =>
  MODELS.find((m) => m.model === resolveModel(model))?.provider;

module.exports = { MODELS, DEFAULT_MODEL, resolveModel, isValidModel, getProvider };
