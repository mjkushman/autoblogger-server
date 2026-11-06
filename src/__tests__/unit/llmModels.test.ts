import { MODELS, DEFAULT_MODEL, resolveModel, isValidModel, getProvider } from "../../utilities/llmModels";

describe("llmModels", () => {
  test("the default model is a listed model", () => {
    expect(isValidModel(DEFAULT_MODEL)).toBe(true);
  });

  test("legacy provider names resolve to real models", () => {
    expect(resolveModel("chatgpt")).toBe(DEFAULT_MODEL);
    expect(isValidModel(resolveModel("claude"))).toBe(true);
    expect(isValidModel("claude")).toBe(true);
  });

  test("a listed model resolves to itself", () => {
    expect(resolveModel("gpt-5.5")).toBe("gpt-5.5");
  });

  test("unknown models are invalid and have no provider", () => {
    expect(isValidModel("gpt-2")).toBe(false);
    expect(getProvider("gpt-2")).toBeUndefined();
  });

  test.each(MODELS)("$model maps to $provider", ({ model, provider }) => {
    expect(getProvider(model)).toBe(provider);
  });

  test("every model's provider is one Chat can build", () => {
    expect(new Set(MODELS.map((m) => m.provider))).toEqual(new Set(["openai", "anthropic"]));
  });
});
