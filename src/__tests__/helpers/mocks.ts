// Shared fakes for everything that leaves the process: LLM SDKs, Unsplash, cron.
// They are wired in by setup.ts, so tests only import the jest.fn()s from here.

export const mockOpenAICreate = jest.fn();
export const mockOpenAIConstructor = jest.fn();
export const mockAnthropicCreate = jest.fn();
export const mockAnthropicConstructor = jest.fn();
export const mockAxiosGet = jest.fn();
export const mockCronSchedule = jest.fn();
/** The web-research call (a model call with the provider's web search tool). Resolves to the notes text. */
export const mockResearch = jest.fn();
export const fakeNotes = "Dogs wag their tails to the right when happy (Journal of Canine Science).";

/** A well-formed LLM post, as the JSON schema asks for it */
export const fakePost = { title: "A Test Title", content: "Some **markdown** content.", tags: [], keywords: [] };

/** Gives every fake a working default. Called before each test. */
export const resetMocks = () => {
  for (const fn of [mockOpenAICreate, mockOpenAIConstructor, mockAnthropicCreate, mockAnthropicConstructor, mockAxiosGet, mockCronSchedule, mockResearch]) {
    fn.mockReset();
  }
  mockResearch.mockResolvedValue(fakeNotes);
  mockOpenAICreate.mockResolvedValue({ choices: [{ message: { content: JSON.stringify(fakePost) } }] });
  mockAnthropicCreate.mockResolvedValue({ content: [{ type: "text", text: JSON.stringify(fakePost) }] });
  mockAxiosGet.mockResolvedValue({ data: { results: [{ urls: { regular: "https://images.test/photo.jpg" } }] } });
  mockCronSchedule.mockImplementation(() => ({ stop: jest.fn() }));
};

/** Makes the next OpenAI/Anthropic call fail the way the SDKs do */
export const providerError = (status: number, message = "provider failure") => Object.assign(new Error(message), { status });
