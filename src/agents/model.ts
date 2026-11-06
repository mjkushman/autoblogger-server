import { ChatOpenAI, tools as openAITools } from "@langchain/openai";
import { ChatAnthropic, tools as anthropicTools } from "@langchain/anthropic";
import { BadRequestError } from "../utilities/expressError";
import { resolveModel, getProvider } from "../utilities/llmModels";

// Research should be light: a few searches at most
const MAX_ANTHROPIC_SEARCHES = 3;

/** Does this agent have an API key of its own? (Whether the provider accepts it is only known when a request is made.) */
export const hasApiKey = (agent): boolean => typeof agent?.llm?.apiKey === "string" && agent.llm.apiKey.trim() !== "";

/**
 * Returns the LangChain chat model for this agent's selected model.
 * Autoblogger is bring-your-own-key: every call is paid for with the agent's own API key, never a key from the server.
 */
export const getChatModel = (agent) => {
  const provider = getProvider(agent.llm?.model);
  if (!provider) throw new Error(`Unsupported model: ${agent.llm?.model}`);

  const name = resolveModel(agent.llm?.model);
  const providerName = provider === "openai" ? "OpenAI" : "Anthropic";
  if (!hasApiKey(agent)) {
    throw new BadRequestError(`This agent has no ${providerName} API key, so it can't write yet. Add your ${providerName} key in the agent's settings.`);
  }

  const apiKey = agent.llm.apiKey.trim();
  if (provider === "openai") {
    return {
      model: new ChatOpenAI({ model: name, apiKey }),
      name,
      providerName,
      strictSchema: true,
      webSearch: openAITools.webSearch({ search_context_size: "low" }),
    };
  }
  return {
    model: new ChatAnthropic({ model: name, apiKey, maxTokens: 16000 }),
    name,
    providerName,
    strictSchema: false, // ChatAnthropic rejects `strict` with the jsonSchema method
    webSearch: anthropicTools.webSearch_20250305({ maxUses: MAX_ANTHROPIC_SEARCHES }),
  };
};
