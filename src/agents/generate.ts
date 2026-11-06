import { HumanMessage, SystemMessage } from "@langchain/core/messages";
import completionPostSchema from "../utilities/completionPostSchema.json";
import { getChatModel } from "./model";
import { buildInstruction } from "./persona";
import { toUserError } from "./errors";

/** Runs one request against the agent's model, written in the agent's voice. Provider failures become user-facing 400s. */
const ask = async <T>(agent, prompts: string[], send: (model, messages, strictSchema: boolean) => Promise<T>): Promise<T> => {
  const { model, name, providerName, strictSchema } = getChatModel(agent);
  const messages = [new SystemMessage(buildInstruction(agent)), ...prompts.map((p) => new HumanMessage(p))];
  try {
    return await send(model, messages, strictSchema);
  } catch (error) {
    throw toUserError(error, providerName, name);
  }
};

/** Asks for a blog post, returned as the JSON in completionPostSchema */
export const generatePost = (agent, prompts: string[]): Promise<Record<string, any>> =>
  ask(agent, prompts, (model, messages, strict) =>
    model
      .withStructuredOutput(completionPostSchema.schema, { name: completionPostSchema.name, method: "jsonSchema", ...(strict && { strict }) })
      .invoke(messages)
  );

/** Asks for a plain-text reply */
export const generateText = (agent, prompts: string[]): Promise<string> =>
  ask(agent, prompts, async (model, messages) => (await model.invoke(messages)).text);
