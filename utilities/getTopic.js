const User = require('../models/user')
const OpenAI = require("openai") 
const {OPEN_AI_KEY} = require('../config')



const openai = new OpenAI({apiKey:OPEN_AI_KEY});

// 1. Determine what to write next
/** Given an author and the author's past works, what should they write next? 
 * Ask the LLM to determine the next article to write 
 * Returns an outline for the next blog post*/
async function getNewOutline(username) {
    
    // get list of aricles already written by this author
    const getAuthorInfo = async (username) => {
        
        let recentTitles = `These are the recent articles you wrote:\n`
        const result = await User.getUser(username)
        const titlesArray = result.posts.map(({title_plaintext}) => (title_plaintext))
        for(let i in titlesArray ) {
            recentTitles += `${Number(i)+1}. "${titlesArray[i]}"\n`
        }
        
        let authorInfo = {
            recentWork: titlesArray,
            authorProfile: result.author_bio
        }

        // console.log('authorInfo:',authorInfo)
        // returns an object with recent work and author profile
        return authorInfo
    }
    let {recentWork,authorProfile} = getAuthorInfo(username)


    // construct the system message
    const systemIntro = `
    You're an author of a popular blog. 
    This is your author profile: 
    ${authorProfile}
    
    This is a list of your recent work:
    ${recentWork}
    `

    // Ask the LLM to suggest the next thing to write.
    const completion = await openai.chat.completions.create({
        messages: [
            { role: "system", content: systemIntro },
            { role: "user", content: `
            Given your author profile and recent works, choose a topic for your next blog post. The new post should be different from other things you've written, but still written in your voice. Create a brief outline of your next blog post.` }],
        model: "gpt-3.5-turbo",
      });
    
      console.log(completion.choices[0].message);

}

// getNewOutline('cleo')


module.exports = getNewOutline