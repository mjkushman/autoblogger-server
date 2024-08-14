const OpenAI = require("openai");
const { OPENAI_API_KEY } = require("../config");
const PostService = require("../services/PostService");

class Message {
  constructor(role, content) {
    this.role = role;
    this.content = content;
  }
}

// I think this will replace LLMService.
class Chat {
  constructor(agent) {
    this.messages = [];
    this.instruction = `
        You're the author of a popular blog${
          agent.Blog.label ? ` named "${agent.Blog.label}"` : ""
        }. 
        ${agent.postSettings.authorBio 
          ? `This is your author bio: ${agent.postSettings.authorBio}`
        : ``}`;
  }
  promptCreated = false;

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
  constructor(agent, apiKey = OPENAI_API_KEY) {
    super(agent);
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
        // response_format: {"type":"json_object"},
      });
      let completion = response.choices[0].message.content;
      // For debugging:
      console.log("COMPLETION:");
      console.log(completion);
      return completion;
    } catch (error) {
      throw new Error(error);
    }
  }
}

class Claude extends Chat {}

// function createPostPromptMessages (agent, topic){
//         const bio = agent.bio;
//         const maxWords = agent.postSettings.maxWords;
//         const messages = []

//         messages.push(new Message(`system`,`You are the author of a popular blog. This is your author bio: ${bio}` ))
//         messages.push(new Message(`user`,`Write a new blog post about the following topic: ${topic}` ))
//         messages.push(new Message(`user`,
//             `Make sure you follow these instructions:
//             1. Expand upon the topic until you reach ${maxWords} words.
//             2. Format the response in HTML with proper HTML tags.
//             3. Include a title in <h1> tags.
//             4. Wrap the rest of the post in a <div> tag with id="primary-content".
//             5. But do not include any boilerplate HTML`, ))
// }

const LLMs = {
  "chatgpt":ChatGPT,
  "claude": Claude
}

module.exports = { ChatGPT, LLMs };
