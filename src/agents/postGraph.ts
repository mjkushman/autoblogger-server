import { Annotation, StateGraph, START, END } from "@langchain/langgraph";
import PostService from "../services/PostService";
import getUnsplashImage from "../utilities/getUnsplashImage";
import { ExpressError } from "../utilities/expressError";
import { cleanText } from "../utilities/sanitizePrompt";
import { generatePost, generateText, generateWithWebSearch } from "./generate";
import { decideTopicPrompts } from "./prompts/decideTopic";
import { researchPrompts } from "./prompts/research";
import { writePostPrompts } from "./prompts/writePost";

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
  const recentTitles = await PostService.findRecentTitles({ agentId: agent.agentId });
  // The topic is a plain-text outline, not a post, so no post JSON schema
  const topic = await generateText(agent, decideTopicPrompts({ recentTitles }));
  return { topic };
};

/**
 * The agent lightly researches the outline on the web. The provider runs the searches itself, capped at a few.
 * Research only improves the post, so if it fails the post is written without notes.
 */
const research = async ({ agent, topic }: State) => {
  try {
    const notes = await generateWithWebSearch(agent, researchPrompts({ topic }));
    // Web pages are untrusted text, so clean the notes like anything else a stranger wrote
    return { notes: cleanText(notes, { maxLength: MAX_NOTES_LENGTH }) };
  } catch (error) {
    console.error(`${agent.username} couldn't research its topic:`, error);
    return { notes: "" };
  }
};

/** The agent writes the post from the outline, and the research notes if it has any */
const writePost = async ({ agent, topic, notes, maxWords }: State) => {
  const post = await generatePost(agent, writePostPrompts({ topic, notes, maxWords }));

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
