import { ChatOpenAI, tools as openAITools } from "@langchain/openai";
import { ChatAnthropic, tools as anthropicTools } from "@langchain/anthropic";
import config from "../config";
import { DEFAULT_MODEL, resolveModel, getProvider } from "../utilities/llmModels";

// Research should be light: a few searches at most
const MAX_ANTHROPIC_SEARCHES = 3;

/** Returns the LangChain chat model for this agent's selected model, using the agent's own API key */
export const getChatModel = (agent) => {
  const provider = getProvider(agent.llm?.model);
  const apiKey = agent.llm?.apiKey || undefined;

  switch (provider) {
    case "openai": {
      const name = resolveModel(agent.llm?.model) || DEFAULT_MODEL;
      // With no key, ChatOpenAI falls back to the OPENAI_API_KEY env var
      return {
        model: new ChatOpenAI({ model: name, apiKey }),
        name,
        providerName: "OpenAI",
        strictSchema: true,
        webSearch: openAITools.webSearch({ search_context_size: "low" }),
      };
    }
    case "anthropic": {
      const name = resolveModel(agent.llm?.model);
      return {
        model: new ChatAnthropic({ model: name, apiKey: apiKey ?? config.ANTHROPIC_KEY, maxTokens: 16000 }),
        name,
        providerName: "Anthropic",
        strictSchema: false, // ChatAnthropic rejects `strict` with the jsonSchema method
        webSearch: anthropicTools.webSearch_20250305({ maxUses: MAX_ANTHROPIC_SEARCHES }),
      };
    }
    default:
      throw new Error(`Unsupported model: ${agent.llm?.model}`);
  }
};
