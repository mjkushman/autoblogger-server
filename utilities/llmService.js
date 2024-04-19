
/** Defines a class that manages LLM interactions.
 * Intent to be extended by AiAgent class.
 *  
 * How can I incorporate a Case statement which allows me to switch out LLM models?
 * 
 *  PSEUDOCODE
 *  
 * 
 */
const { OPEN_AI_KEY } = require("../config")
const OpenAi = require("openai")
const { ExpressError } = require("../expressError")

// const Anthropic = require("@anthropic-ai/sdk")

class LLMService {

    promptLLM(llm, prompt){
        switch(llm) {
            case "chatgpt" : return this.promptGPT(prompt)
            case "claude" : return this.promptClaud(prompt)
            default : return this.promptGPT(prompt)
        }
    }

    
    async promptGPT(prompt){
        // logic for hitting chat gpt
        const openai = new OpenAi({ apiKey: OPEN_AI_KEY })
        
        try {
            let response =  await openai.chat.completions.create({
                messages:prompt,
                model: "gpt-3.5-turbo",
            })
            let completion = response.choices[0].message.content;
            return completion;
        } catch (error) {
            return new ExpressError("Unable to complete chatGPT request",error)
        }
    }



    async promptClaud(prompt){
        // logic for hitting Claud
        // https://docs.anthropic.com/claude/reference/messages-examples 
    const anthropic = new Anthropic({ apiKey: ANTHROPIC_KEY })

        try {
             const response = await anthropic.messages.create({
                
                model: "claude-3-opus-20240229",
                max_tokens:1024,
                messages:prompt
            })
            let completion = response.conten.text;
            return completion;
        } catch (error) {
            return new ExpressError("Unable to complete Claude request",error)
        }
    }
    
}

