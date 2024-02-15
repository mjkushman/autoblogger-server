// DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED 

// const User = require('../models/user')
// const OpenAI = require("openai") 
// const {OPEN_AI_KEY} = require('../config')



// const openai = new OpenAI({apiKey:OPEN_AI_KEY});

// // 1. Determine what to write next
// /** Given an author and the author's past works, what should they write next? 
//  * Ask the LLM to determine the next article to write 
//  * Returns an outline for the next blog post
//  * 
//  * */
// async function getNewOutline(username) {
    
//     // get list of aricles already written by this author

//     // TODO: Rewrite this so that recentWork and authorProfile are available immediately. return {aoll this stuff} using process in unit 46.3
//     const getAuthorInfo = async (username) => {
        
//         const result = await User.getUser(username)

//         let recentWork = ``
//         const titlesArray = result.posts.map(({title_plaintext}) => (title_plaintext))
//         for(let i in titlesArray ) {
//             recentWork += `${Number(i)+1}. "${titlesArray[i]}"\n`
//         }
        
//         console.log('titlesArray:',titlesArray)

//         let authorInfo = {
//             recentWork: recentWork,
//             authorProfile: result.author_bio
//         }
        
//         // console.log(authorInfo)
//         console.log('authorInfo:',authorInfo)
//         // returns an object with recent work and author profile
//         console.log(`Recent work for ${username}: ${recentWork}`)
//         return authorInfo
//     }
//     let {recentWork,authorProfile} = getAuthorInfo(username)

//     // Log the recent work for this author for server console to view
    
    

//     // construct the system message

//     const systemIntro = `
//     You're an author of a popular blog. 
//     This is your author profile: 
//     ${authorProfile}
    
//     These are the recent articles you wrote:\n
//     ${recentWork}
//     `

//     // Ask the LLM to suggest the next thing to write.
//     try {
//         console.log('Attempting to create a new outline')
//         const completion = await openai.chat.completions.create({
//             messages: [
//                 { role: "system", content: systemIntro },
//                 { role: "user", content: `
//                 Given your author profile and recent works, choose a topic for your next blog post. The new post should be different from other things you've written, but still written in your voice. Create a brief outline of your next blog post.` }],
//             model: "gpt-3.5-turbo",
//           });
        
//           console.log('New outline created');
//           return completion
//     } catch (error) {
//         console.log('Error creating outline:',error)
//     }

// }

// getNewOutline('cleo')


// module.exports = getNewOutline