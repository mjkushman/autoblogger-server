// DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED DEPRECATED 

// /** This main function below writes a new blog post.
//  *
//  *
//  * Given an author's username, the function
//  *  1. Uses a helper function to generate a blog post outline
//  *  2. Asks Open AI's LLM to write a new blog post based on the outline
//  *  3. Saves the new post to the database
//  *
//  *
//  */

// const Post = require("../models/post");
// const User = require("../models/user");
// const getNewOutline = require("./getOutline");
// const { OPEN_AI_KEY } = require("../config");

// const OpenAI = require("openai");
// const { htmlToText } = require("html-to-text");
// const { ExpressError } = require("../expressError");

// const openai = new OpenAI({ apiKey: OPEN_AI_KEY });
// // 2. Write the article


// async function aiWritePost(username = "cleo") {
//   // Use helper function to generate a post outline
//   const outline = getNewOutline(username);

//   let author = await User.getUser(username);
//   if (!author) throw ExpressError(`Could not find author ${username} `);

//   // Generate the blog post as a completion

//   const completion = await openai.chat.completions.create({
//     messages: [
//       {
//         role: "system",
//         content: `You are the author of a popular blog. This is your profile: ${author.author_bio}`,
//       },
//       {
//         role: "user",
//         content: `
//         Write a new blog post using the following outline and instructions.
//         OUTLINE: ${outline}


//         INSTRUCTIONS:
//         1. Complete the post with fewer than 500 words.
//         2. Format the response in HTML with proper HTML tags.
//         3. Include a title in <h1> tags.
//         4. Wrap the entire post in <body> tags.
//         5. But do not include any boilerplate HTML`,
//       },
//     ],
//     model: "gpt-3.5-turbo",
//   });

//   // Parse the completion for specific elements

//   const bodyHtml = completion.choices[0].message.content;
//   // const bodyPlaintext = htmlToText(bodyHtml)
//   // const title = htmlToText(bodyHtml, {
//   //   baseElements:{ selectors: ['h1'] },
//   // });

//   const post = {
//     userId: author.user_id,
//     title: (title = htmlToText(bodyHtml, {
//       baseElements: { selectors: ["h1"] },
//     })),
//     bodyHtml: bodyHtml,
//     bodyPlaintext: htmlToText(bodyHtml),
//   };

//   // 3. Add the article to database
//   try {
//     const newPost = await Post.createNewPost(post);
//     // console.log(newPost);
//     console.log(`
//     New post created!
//     Author: ${username}
//     Title: ${newPost.title_plaintext}
//     Created at: ${newPost.created_at}`);

//     return newPost;
//   } catch (error) {
//     console.log("Error adding new post to database:", error);
//   }
// }

// module.exports = aiWritePost;
