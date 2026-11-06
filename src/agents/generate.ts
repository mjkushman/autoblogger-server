import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import completionPostSchema from "./prompts/postSchema.json";
import { personaPrompt } from "./prompts/persona";
import { getChatModel } from "./model";
import { toUserError } from "./errors";

/** Runs one request against the agent's model, written in the agent's voice. Provider failures become user-facing 400s. */
const ask = async <T>(agent, prompts: string[], send: (chat: ReturnType<typeof getChatModel>, messages) => Promise<T>): Promise<T> => {
  const chat = getChatModel(agent);
  const messages = [new SystemMessage(personaPrompt(agent)), ...prompts.map((p) => new HumanMessage(p))];
  try {
    return await send(chat, messages);
  } catch (error) {
    throw toUserError(error, chat.providerName, chat.name);
  }
};

/** Asks for a blog post, returned as the JSON in completionPostSchema */
export const generatePost = (agent, prompts: string[]): Promise<Record<string, any>> =>
  ask(agent, prompts, ({ model, strictSchema }, messages) =>
    model
      .withStructuredOutput(completionPostSchema.schema, {
        name: completionPostSchema.name,
        method: "jsonSchema",
        ...(strictSchema && { strict: true }),
      })
      .invoke(messages)
  );

/** Asks for a plain-text reply */
export const generateText = (agent, prompts: string[]): Promise<string> =>
  ask(agent, prompts, async ({ model }, messages) => (await model.invoke(messages)).text);

/** Asks for a plain-text reply, and lets the provider search the web first (a few searches at most) */
export const generateWithWebSearch = (agent, prompts: string[]): Promise<string> =>
  ask(agent, prompts, async ({ model, webSearch }, messages) => (await model.invoke(messages, { tools: [webSearch] })).text);
