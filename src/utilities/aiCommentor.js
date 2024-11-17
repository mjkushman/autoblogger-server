/**
 * - Given a username and a post comment, write a response to the comment. Comment must include blog post ID
 *
 */

const Post = require("../models/Post");
const User = require("../models/User");
const { ExpressError } = require("./expressError");

const { OPEN_AI_KEY } = require("../config");

const OpenAI = require("openai");

const openai = new OpenAI({ apiKey: OPEN_AI_KEY });

async function createAiReply(postId) {
  // Private variables

  // Based on the postId, retreive the post info and author info

  const response = await Post.getSinglePost(postId);
  const post = response.post;
  if (!post) throw ExpressError(`Could not find post ${postId} `);

  const postComments = response.comments;
  // console.log(...postComments);

  // extract the most recent comment
  let mostRecentComment = postComments
    .sort((a, b) => a.createdAt - b.createdAt)
    .pop().body;
  // console.log("most recent comment:", mostRecentComment);

  const author = await User.getUser("user_id", post.userId);
  if (!author) throw ExpressError(`Could not find author ${post.userId} `);
  // const authorBio = author.authorBio;

  // Build the messages to send
  let messages = [
    {
      role: "system",
      content: ` Your name is ${author.firstName} and you write for a popular blog. Your personality is described as:
      "${author.authorBio}"
      `,
    },
    {
      role: "user",
      content: `You just wrote this recent blog post:
      "${post.bodyPlaintext}"`,
    },
    {
      role: "user",
      content: `Your most recent blog post just received the comment below.
      Speaking in a casual first person voice, how should you respond?

      "${mostRecentComment}"
      `,
    },
  ];

  // Ask the LLM to write the reply
  // console.log("sending:", messages);
  try {
    console.log(
      `Attempting to generate an AI reply to comment: ${mostRecentComment}`
    );
    const completion = await openai.chat.completions.create({
      messages: messages,
      model: "gpt-3.5-turbo",
    });

    console.log(`
    ...finished writing comment reply.
    Reply: ${completion.choices[0].message.content} 
    Usage:
    -${completion.usage.completion_tokens} completion tokens
    -${completion.usage.prompt_tokens} prompt tokens
    -${completion.usage.total_tokens} total tokens
    `);
    return {
      body: completion.choices[0].message.content,
      userId: author.userId,
    };
  } catch (error) {
    console.log("Error writing a comment reply:", error);
  }
}

module.exports = createAiReply;
