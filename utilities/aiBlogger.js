/*
 *  aiBlogger accepts a username and returns an object with several methods
 * - Given a username, create an outline. Specify an optional topic?
 * - Given an outline, write a blog post
 *
 */

const Post = require("../models/Post");
const User = require("../models/User_new");

const { OPEN_AI_KEY } = require("../config");

const OpenAI = require("openai");
const { ExpressError } = require("./expressError");
const htmlParser = require('./htmlParser')
const getUnsplashImage = require('./getUnsplashImage')

const openai = new OpenAI({ apiKey: OPEN_AI_KEY });



async function createAiBlogger(username = "cleo") {
  // Private variables

  // Based on the username, retreive the blogger's information.

  let author = await User.getUser('username',username);
  if (!author) throw ExpressError(`Could not find author ${username} `);
  const authorBio = author.authorBio;


/**
 * List the author's recent work in a string

 * Should resemble a string like
 *  "1. Some title
 *  2. Another title
 *  3. Yet another ttle
 *  ...
 *  14. As many as 14 titles"
 
 */ 
  let recentWork = ``
  const titlesArray = author.posts.map(
    ({ titlePlaintext }) => titlePlaintext);
  for (let i=0; i <= (Math.min(14, titlesArray.length)); i++) {
    
    recentWork += `${Number(i) + 1}. "${titlesArray[i]}"\n`;
  }
  // console.log('titlesArray',titlesArray)
  // console.log('recentWork',recentWork)

  // Return public variables
  return {
    /** Create an outline for a new blog post. Requires recent work listed as a string.
    */
    async createOutline() {
      // Build the messages to send
      let messages = [
        { role: "system", content: ` You're an author of a popular blog. 
        This is your author profile: 
        ${authorBio}
        
        These are the recent articles you wrote:\n
        ${recentWork}
        ` },
        { role: "user", content: `Given your author profile and recent works, choose a topic for your next blog post. The new post should be different from other things you've written, but still written in your voice. Create a brief outline of your next blog post.` }]
      
        // Ask the LLM to suggest the next thing to write.
      // console.log('sending:',messages)
      try {
          console.log('Attempting to create a new outline...')
          const completion = await openai.chat.completions.create({
            messages: messages,
              model: "gpt-3.5-turbo",
            });
            
            console.log('...finished creating outline.');
            return completion.choices[0].message.content
      } catch (error) {
          console.log('Error creating outline:',error)
      }
    },
    
    /** Now write the blog post, given an outline.
     */
    
    async writeBlogPost(outline) {
      // Asks LLM to write the blog post
      console.log('Writing a new post...')
      
      let messages = [
        {
          role: "system",
          content: `You are the author of a popular blog. This is your profile: ${author.authorBio}`,
        },
        {
          role: "user",
          content: `
          Write a new blog post using the following outline and instructions.
          OUTLINE:
          ${outline}
  
  
          INSTRUCTIONS:
          1. Complete the post with fewer than 1000 words.
          2. Format the response in HTML with proper HTML tags.
          3. Include a title in <h1> tags.
          4. Wrap the rest of the post in a <div> tag with id="primary-content".
          5. But do not include any boilerplate HTML`,
        },
      ]
      
      // send request to LLM

      const completion = await openai.chat.completions.create({
        messages: messages,
        model: "gpt-3.5-turbo",
      });

      if(!completion) throw new ExpressError('Something went wrong while trying to write the blog post')

    // Parse the completion for specific elements
    
    const responseHtml = completion.choices[0].message.content;
    
    // console.log('HTML RESPONSE FROM LLM:',responseHtml)
    
    const postData = htmlParser(responseHtml)

    // Get a random image based on the post title
    const imageUrl = await getUnsplashImage(postData.titlePlaintext)
    // console.log('aiBlogger imageUrl',imageUrl)


    // Add the article to database
    try {
      const newPost = await Post.createNewPost({...postData, userId:author.userId, imageUrl:String(imageUrl)});
      console.log(`
      New post created!
      postId: ${newPost.postId}
      Author: ${newPost.userId}
      Title: ${newPost.titlePlaintext}
      Image: ${newPost.imageUrl}
      Created at: ${newPost.createdAt}`);
  
      return newPost;
      
    } catch (error) {
      console.log('error creating post:',error)
    }  

      }

    };

};

module.exports = createAiBlogger;
