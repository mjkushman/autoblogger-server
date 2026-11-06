// The models an agent can be set to. The client keeps a matching list in
// autoblogger-client/src/app/fixtures/llmModels.ts. Keep the two in sync.
export const MODELS = [
  { model: "gpt-5.4-mini", label: "GPT-5.4 mini", provider: "openai" },
  { model: "gpt-5.4", label: "GPT-5.4", provider: "openai" },
  { model: "gpt-5.5", label: "GPT-5.5", provider: "openai" },
  { model: "claude-haiku-5-5", label: "Claude Haiku 5.5", provider: "anthropic" },
  { model: "claude-sonnet-5-5", label: "Claude Sonnet 5.5", provider: "anthropic" },
  { model: "claude-opus-5-5", label: "Claude Opus 5.5", provider: "anthropic" },
];

export const DEFAULT_MODEL = "gpt-5.4-mini";

// Agents saved before models were selectable stored a provider name instead.
const LEGACY_MODELS: Record<string, string> = { chatgpt: DEFAULT_MODEL, claude: "claude-sonnet-5-5" };

export const resolveModel = (model: string): string => LEGACY_MODELS[model] ?? model;

export const isValidModel = (model: string): boolean =>
  MODELS.some((m) => m.model === resolveModel(model));

export const getProvider = (model: string): string | undefined =>
  MODELS.find((m) => m.model === resolveModel(model))?.provider;

