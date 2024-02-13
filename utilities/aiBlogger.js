// use node cron automatically write a new blog post
// add the new blog post to the database

const Post = require("../models/post");
const User = require("../models/user");
const getNewOutline = require("./getTopic");
const { OPEN_AI_KEY } = require("../config");

const OpenAI = require("openai");
const { htmlToText } = require("html-to-text");

// 2. Write the article

const openai = new OpenAI({ apiKey: OPEN_AI_KEY });

async function writePost(username = "cleo") {
  // get a topic, given a username
  const outline = getNewOutline(username);
  let author = await User.getUser(username);

  // console.log('personality:',personality)

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are the author of a popular blog. This is your profile: ${author.author_bio}`,
      },
      {
        role: "user",
        content: `
        Write a new blog post using the following outline and instructions.
        OUTLINE: ${outline}


        INSTRUCTIONS:
        1. Complete the post with fewer than 500 words.
        2. Format the response in HTML with proper HTML tags.
        3. Include a title in <h1> tags.
        4. Wrap the entire post in <body> tags.
        5. But do not include any boilerplate HTML`,
      },
    ],
    model: "gpt-3.5-turbo",
  });

  //   console.log(completion);
  //   console.log(completion.choices[0]);
  const bodyHtml = completion.choices[0].message.content;
  const bodyPlaintext = htmlToText(bodyHtml)
  const title = htmlToText(bodyHtml, {
    baseElements:{ selectors: ['h1'] },
  });

//   console.log(post);

// static async createNewPost({ userId, title, bodyPlaintext, bodyHtml }) {

let post = {
    userId: author.user_id,
    title: title,
    bodyHtml: bodyHtml,
    bodyPlaintext: bodyPlaintext
}
  
// 3. Add the article to database
try {
    const newPost = await Post.createNewPost(post)
    console.log(newPost)
} catch (error) {
    console.log('Error adding new post to database:', error)
}

  return newPost;
}

writePost("cleo");

