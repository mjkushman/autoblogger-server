/** Defines a class that manages LLM interactions.
 * Intent to be extended by AiAgent class.
 *
 * How can I incorporate a Case statement which allows me to switch out LLM models?
 *
 *
 *
 *
 */
const { OPENAI_API_KEY } = require("../config");
const { ANTHROPIC_KEY } = require("../config");
const OpenAi = require("openai");
const Anthropic = require("@anthropic-ai/sdk");
const { ExpressError } = require("../utilities/expressError");

class LLMService {
  static openai = new OpenAi({ apiKey: OPENAI_API_KEY });
  static anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY });

  /** Asks LLM to decide on a new topic to write about, based on the author's bio and recent work.
   * @returns Topic.: An outline of the next article to write when calling writeBlogPost
   */
//   async #decideBlogTopic(llm) {
//     console.log(`${this.username} is deciding what topic to write about`);
//     let recentWork = await this.#getRecentWork();
//     console.log(`DEBUGGING recentWork: ${recentWork}`); // For debugging

//     const recentWorkBlock =
//       recentWork.length > 0
//         ? `These are recent articles you've written: ${recentWork}`
//         : "";

//     // Prompt construction:

//     let messages = [
//       {
//         role: "system",
//         content: ` You're an author of a popular blog. ${this.bioBlock} ${recentWorkBlock}`,
//       },
//       {
//         role: "user",
//         content: `Given your author profile and recent works, choose a topic for your next blog post. The new post should be different from other things you've written, but still written in your voice. Create a brief outline of your next blog post.`,
//       },
//     ]; 

//     try {
//       const response = await super.promptLLM(messages, (llm = "chatgpt"));
//       console.log(`${this.username} finished deciding blog topic.`);
//       return response;
//     } catch (error) {
//       return new ExpressError(
//         `${this.username} was unable to prompt LLM to decide on a topic.  ${error}`
//       );
//     }
//   }

    testfunc() {
        return this.openai.chat.completions.create({})
    }

  promptLLM(messages, llm) {
    console.log(`Entering Switch:
        - messages: ${messages}
        - llm: ${llm}`);

    switch (llm) {
      case "chatgpt": {
        this.#promptGPT(messages);
        break;
      }
      case "claude": {
        this.#promptClaude(messages);
        break;
      }
      default:
        return this.#promptGPT(messages);
    }
  }

  async #promptGPT(messages) {
    // logic for hitting chat gpt

    // For debugging:
    console.log(`About to request ChatGPT completion.`);

    try {
      let response = await this.openai.chat.completions.create({
        messages: messages,
        // messages: [{ role: "system", content: "You are a helpful assistant." }],
        model: "gpt-3.5-turbo",
      });

      console.log("RESPONSE:");
      console.log(response);
      let completion = response.choices[0].message.content;
      // For debugging:

      console.log("COMPLETION:");
      console.log(completion);
      return completion;
    } catch (error) {
      throw new ExpressError("Unable to complete chatGPT request", error);
    }
  }

  async #promptClaude(messages) {
    // logic for hitting Claud
    // https://docs.anthropic.com/claude/reference/messages-examples

    // For debugging:
    console.log(`About to request CLAUDE completion.`);
    console.log(`Messages:`);
    console.dir(messages);

    try {
      const response = await this.anthropic.messages.create({
        model: "claude-3-opus-20240229",
        max_tokens: 1024,
        messages: messages,
      });
      // For debugging:
      console.log("CLAUDE RESPONSE:", response);
      let completion = response.content.text;
      // For debugging:
      console.log("COMPLETION:");
      console.log(completion);
      return completion;
    } catch (error) {
        throw new ExpressError("Unable to complete Claude request", error);
    }
  }
}

module.exports = LLMService;
