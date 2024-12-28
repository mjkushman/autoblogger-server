const OpenAI = require("openai");
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
    // for GPT, instructin gets used as a system message. For claude, it's a system parameter.
    throw new Error("sendPrompt must be implemented in sub class");
  }
}

class ChatGPT extends Chat {
  constructor(agent) {
    super(agent);
    const apiKey = agent.apiKey;
    console.log("ChatGPT constructed");
    this.agent = agent;
    // this.instruction = super.instruction;
    this.llm = new OpenAI({ apiKey });
    this.addMessage("system", this.instruction); // Adds the instruction to messages array. Claude will do something else with it.
  }
  // Depening on the use case (get topic, write post) I should use further functions to build the messages array

  // When it's initialized, an instruction is automatically added to messages
  // No I need to add functions that
  // 1. create the topic getting prompt
  // 2. create teh post writer prompt

  // Sends a fully constructed messages block to the api
  async sendPrompt() {
    try {
      const response = await this.llm.chat.completions.create({
        messages: this.getMessages(),
        model: "gpt-4o-mini",
        response_format: {"type":"json_schema", "json_schema": completionPostSchema},
      });
      const completion = JSON.parse(response.choices[0].message.content);
      // For debugging:
      console.log("COMPLETION:");
      console.log(completion);
      return completion;
    } catch (error) {
      throw new Error(error);
    }
  }
}

// TODO
class Claude extends Chat {}

const LLMs = {
  chatgpt: ChatGPT,
  // claude: Claude,
};

module.exports = { ChatGPT, LLMs };
