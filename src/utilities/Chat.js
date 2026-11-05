const OpenAI = require("openai");
const Anthropic = require("@anthropic-ai/sdk");
const config = require("../config");
const { BadRequestError } = require("./expressError");
const { DEFAULT_MODEL, resolveModel, getProvider } = require("./llmModels");
const completionPostSchema = require("./completionPostSchema.json");


class Message {
  constructor(role, content) {
    this.role = role;
    this.content = content;
  }
}

class Chat {
  constructor(agent) {
    this.messages = [];
    this.instruction = `
        You're a talented writer for a popular publication. 
        ${
  agent.postSettings.personality ? `This is your personality: "${agent.postSettings.personality}"` : ""
}`;
    console.log(`Initial instruction: ${this.instruction}`);
  }
  addMessage(role, content) {
    const message = new Message(role, content);
    this.messages.push(message);
  }
  getMessages() {
    return this.messages;
  }

  /** Sends the conversation to the model. Pass { schema: false } for a plain-text reply. */
  async sendPrompt(params) {
    // GPT sends the instruction as a system message. Claude sends it as a system parameter.
    throw new Error("sendPrompt must be implemented in sub class");
  }

  /** Turns a provider failure into a 400 whose message the user can act on */
  toUserError(error, providerName) {
    console.error(`${providerName} request failed:`, error);
    switch (error?.status) {
      case 401:
      case 403:
        return new BadRequestError(
          `${providerName} rejected this agent's API key. Check that the key is correct and still active.`
        );
      case 404:
        return new BadRequestError(
          `${providerName} doesn't recognize the model "${this.model}" for this key. Choose a different model.`
        );
      case 429:
        return new BadRequestError(
          `${providerName} is rate limiting this key, or the account is out of credit. Check your ${providerName} billing and try again.`
        );
      default:
        return new BadRequestError(
          error?.status
            ? `${providerName} returned an error: ${error.message}`
            : `We couldn't read ${providerName}'s response. Please try again.`
        );
    }
  }
}

class ChatGPT extends Chat {
  constructor(agent) {
    super(agent);
    this.model = resolveModel(agent.llm?.model) || DEFAULT_MODEL;
    // An empty key falls back to the OPENAI_API_KEY env var
    this.llm = new OpenAI({ apiKey: agent.llm?.apiKey || undefined });
  }

  async sendPrompt({ schema = true } = {}) {
    try {
      const response = await this.llm.chat.completions.create({
        messages: [
          { role: "system", content: this.instruction },
          ...this.getMessages(),
        ],
        model: this.model,
        ...(schema && {
          response_format: { type: "json_schema", json_schema: completionPostSchema },
        }),
      });
      const content = response.choices[0].message.content;
      return schema ? JSON.parse(content) : content;
    } catch (error) {
      throw this.toUserError(error, "OpenAI");
    }
  }
}

class Claude extends Chat {
  constructor(agent) {
    super(agent);
    this.model = resolveModel(agent.llm?.model);
    // An empty key falls back to the ANTHROPIC_KEY env var
    this.llm = new Anthropic({
      apiKey: agent.llm?.apiKey || config.ANTHROPIC_KEY,
    });
  }

  async sendPrompt({ schema = true } = {}) {
    try {
      const response = await this.llm.messages.create({
        model: this.model,
        max_tokens: 16000,
        system: this.instruction,
        messages: this.getMessages(),
        ...(schema && {
          output_config: {
            format: { type: "json_schema", schema: completionPostSchema.schema },
          },
        }),
      });
      const text = response.content.find((block) => block.type === "text")?.text;
      return schema ? JSON.parse(text) : text;
    } catch (error) {
      throw this.toUserError(error, "Anthropic");
    }
  }
}

const PROVIDERS = {
  openai: ChatGPT,
  anthropic: Claude,
};

/** Returns a Chat for the provider that serves this agent's selected model */
const createChat = (agent) => {
  const Provider = PROVIDERS[getProvider(agent.llm?.model)];
  if (!Provider) throw new Error(`Unsupported model: ${agent.llm?.model}`);
  return new Provider(agent);
};

module.exports = { createChat };
