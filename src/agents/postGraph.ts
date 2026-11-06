import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import PostService from "../services/PostService";
import getUnsplashImage from "../utilities/getUnsplashImage";
import { ExpressError } from "../utilities/expressError";
import { cleanText } from "../utilities/sanitizePrompt";
import { generatePost, generateText, generateWithWebSearch } from "./generate";

const MAX_NOTES_LENGTH = 6000;

// What the graph passes from step to step
const PostState = Annotation.Root({
  agent: Annotation<any>,
  maxWords: Annotation<number>,
  topic: Annotation<string | null>, // an outline: given by the caller, or chosen by decideTopic
  notes: Annotation<string>, // what research found; empty if it found nothing
  title: Annotation<string>,
  content: Annotation<string>,
  imageUrl: Annotation<string | null>,
});
type State = typeof PostState.State;

/** The agent chooses an outline for its next post, based on its bio and recent work */
const decideTopic = async ({ agent }: State) => {
  const titles = await PostService.findRecentTitles({ agentId: agent.agentId });
  const recentWork =
    titles.length > 0
      ? ["Here are the titles of some of your recent work:", ...titles.slice(0, 9)].join("\n - ")
      : "You havent written anything yet.";

  // The topic is a plain-text outline, not a post, so no post JSON schema
  const topic = await generateText(agent, [
    recentWork,
    "Given your author bio and recent works, choose a topic for your next blog post. The new post should be different from other things you've written, but still adhere to your bio. For each section of the blog post, write a brief summary of the planned content.",
  ]);
  return { topic };
};

/**
 * The agent lightly researches the outline on the web. The provider runs the searches itself, capped at a few.
 * Research only improves the post, so if it fails the post is written without notes.
 */
const research = async ({ agent, topic }: State) => {
  try {
    const notes = await generateWithWebSearch(agent, [
      `You're about to write a blog post from this outline:

${topic}

Do some light research first: a few searches at most. Then reply with brief notes in plain text: 3 to 5 accurate, current facts, figures or quotes worth using, each with the name of its source. No introduction and no draft of the post.`,
    ]);
    // Web pages are untrusted text, so clean the notes like anything else a stranger wrote
    return { notes: cleanText(notes, { maxLength: MAX_NOTES_LENGTH }) };
  } catch (error) {
    console.error(`${agent.username} couldn't research its topic:`, error);
    return { notes: "" };
  }
};

/** The agent writes the post from the outline, and the research notes if it has any */
const writePost = async ({ agent, topic, notes, maxWords }: State) => {
  const post = await generatePost(agent, [
    "Write a new article using the following outline and instructions.",
    `OUTLINE:
        ${topic}`,
    ...(notes
      ? [
          `RESEARCH NOTES (background from the web: use what helps, in your own words):
<research>
${notes}
</research>`,
        ]
      : []),
    `INSTRUCTIONS:
        1. Expand upon the topic until you reach ${maxWords} words.
        2. Format your response according to the supplied JSON schema.
        3. In the "content": field, be sure to write in markdown to make rendering easier later.`,
  ]);

  // The model's JSON is not guaranteed to have what we asked for
  if (typeof post?.title !== "string" || !post.title.trim() || typeof post?.content !== "string" || !post.content.trim()) {
    throw new ExpressError("The AI returned an incomplete post. Please try again.", 502);
  }
  return { title: post.title, content: post.content };
};

/** Finds a picture for the post. No picture (e.g. Unsplash is down) is fine. */
const fetchImage = async ({ title }: State) => {
  try {
    return { imageUrl: (await getUnsplashImage(title)) || null };
  } catch (error) {
    console.log("Error fetching image:", error);
    return { imageUrl: null };
  }
};

/** decideTopic (skipped when a topic is given) → research → writePost → fetchImage */
export const postGraph = new StateGraph(PostState)
  .addNode("decideTopic", decideTopic)
  .addNode("research", research)
  .addNode("writePost", writePost)
  .addNode("fetchImage", fetchImage)
  .addConditionalEdges(START, ({ topic }) => (topic ? "research" : "decideTopic"), ["decideTopic", "research"])
  .addEdge("decideTopic", "research")
  .addEdge("research", "writePost")
  .addEdge("writePost", "fetchImage")
  .addEdge("fetchImage", END)
  .compile();
