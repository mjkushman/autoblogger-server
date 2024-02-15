/**
 * - Given a username and a post comment, write a response to the comment. Comment must include blog post ID
 *
 */

const Post = require("../models/post");
const User = require("../models/user");

const { OPEN_AI_KEY } = require("../config");

const OpenAI = require("openai");
const { ExpressError } = require("../expressError");

const openai = new OpenAI({ apiKey: OPEN_AI_KEY });

async function createAiReply(postId) {
  // Private variables

  // Based on the postId, retreive the post info and author info

  const post = await Post.getSinglePost(postId);
  if (!post) throw ExpressError(`Could not find post ${postId} `);

  const postComments = post.comments;

  const author = await User.getUserById(post.user_id);
  if (!author) throw ExpressError(`Could not find author ${post.user_id} `);
  const authorBio = author.author_bio;

  // Return public variables

  /** Create an outline for a new blog post. Requires recent work listed as a string.
   */

  // Build the messages to send
  let messages = [
    {
      role: "system",
      content: ` You're an author of a popular blog. 
        This is your author biography: 
        ${authorBio}`,
    },
    {
      role: "user",
      content: `Your recent blog article just received a new comment. Please write a thoughtful response to the comment. Please be consider the context of the blog post content and your biography.
        
        Your recent blog post:
        ${post.body_plaintext}
        
        The comment you should reply to:
        ${postComments[0].body}`,
    },
  ];

  // Ask the LLM to write the reply
  console.log("sending:", messages);
  try {
    console.log("Attempting to write a reply to a comment");
    const completion = await openai.chat.completions.create({
      messages: messages,
      model: "gpt-3.5-turbo",
    });

    console.log("...comment reply written");
    return {
      body: completion.choices[0].message.content,
      userId: author.user_id
    }
    ;
  } catch (error) {
    console.log("Error writing a comment reply:", error);
  }
}

module.exports = createAiReply;
