
/** Defines a class that manages LLM interactions.
 * Intent to be extended by AiAgent class.
 *  
 * How can I incorporate a Case statement which allows me to switch out LLM models?
 * 
 *  
 * 
 * 
 */
const { OPEN_AI_KEY } = require("../config")
const { ANTHROPIC_KEY } = require("../config")
const OpenAi = require("openai")
// const Anthropic = require("@anthropic-ai/sdk")
const Anthropic = require('@anthropic-ai/sdk')
const { ExpressError } = require("../expressError")


class LLMService {
    static openai = new OpenAi({ apiKey: OPEN_AI_KEY })
    static anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })

    promptLLM(messages,llm){
        console.log(`Entering Switch:
        - messages: ${messages}
        - llm: ${llm}`)
        
        switch(llm) {
            case "chatgpt" : {
                this.#promptGPT(messages);
                break;
            }
            case "claude" : {
                this.#promptClaude(messages);
                break;
            } 
            default : return this.#promptGPT(messages)
        }
    }


    async #promptGPT(messages){
        // logic for hitting chat gpt
        
        
        // For debugging:
        console.log(`About to request ChatGPT completion.`)
        // console.log(`Messages:`)
        // console.dir(messages) 
        try {
            let response = await this.openai.chat.completions.create({
                messages:messages,
                // messages: [{ role: "system", content: "You are a helpful assistant." }],
                model: "gpt-3.5-turbo",
            })
            
            console.log("RESPONSE:")
            console.log(response)
            let completion = response.choices[0].message.content;
            // For debugging:
            
            console.log("COMPLETION:")
            console.log(completion)
            return completion;
        } catch (error) {
            return new ExpressError("Unable to complete chatGPT request",error)
        }
    }



    async #promptClaude(messages){
        // logic for hitting Claud
        // https://docs.anthropic.com/claude/reference/messages-examples 
    
    // For debugging:
    console.log(`About to request CLAUDE completion.`)
    console.log(`Messages:`)
        console.dir(messages) 

        try {
             const response = await this.anthropic.messages.create({
                
                model: "claude-3-opus-20240229",
                max_tokens:1024,
                messages:messages
            })
            // For debugging:
            console.log('CLAUDE RESPONSE:',response)
            let completion = response.content.text;
            // For debugging:
            console.log("COMPLETION:")
            console.log(completion)
            return completion;
        } catch (error) {
            return new ExpressError("Unable to complete Claude request",error)
        }
    }
    
}


module.exports = LLMService