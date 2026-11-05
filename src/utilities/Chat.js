const OpenAI = require("openai");
const Anthropic = require("@anthropic-ai/sdk");
const config = require("../config");
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

  async sendPrompt(params) {
    // GPT sends the instruction as a system message. Claude sends it as a system parameter.
    throw new Error("sendPrompt must be implemented in sub class");
  }
}

class ChatGPT extends Chat {
  constructor(agent) {
    super(agent);
    this.model = resolveModel(agent.llm?.model) || DEFAULT_MODEL;
    // An empty key falls back to the OPENAI_API_KEY env var
    this.llm = new OpenAI({ apiKey: agent.llm?.apiKey || undefined });
  }

  async sendPrompt() {
    try {
      const response = await this.llm.chat.completions.create({
        messages: [
          { role: "system", content: this.instruction },
          ...this.getMessages(),
        ],
        model: this.model,
        response_format: {"type":"json_schema", "json_schema": completionPostSchema},
      });
      const completion = JSON.parse(response.choices[0].message.content);
      return completion;
    } catch (error) {
      throw new Error(error);
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

  async sendPrompt() {
    try {
      const response = await this.llm.messages.create({
        model: this.model,
        max_tokens: 16000,
        system: this.instruction,
        messages: this.getMessages(),
        output_config: {
          format: { type: "json_schema", schema: completionPostSchema.schema },
        },
      });
      const text = response.content.find((block) => block.type === "text")?.text;
      return JSON.parse(text);
    } catch (error) {
      throw new Error(error);
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
