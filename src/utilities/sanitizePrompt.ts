// Cleans user-supplied text before it is stored or placed into an AI prompt.
//
// Prompt injection can't be fully prevented by filtering, so this is one layer of several:
//  1. strip what is used to hide or fake structure (invisible characters, tags, role headers)
//  2. cap lengths
//  3. reject wording that is plainly an attempt to override the AI's instructions
// Prompts also wrap user text in labelled tags and tell the model to treat it as data (see agents/prompts/).
import { BadRequestError } from "./expressError";

// Control, zero-width and bidi characters: used to smuggle text a human reviewer can't see
const INVISIBLE =
  /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F​-‏‪-‮⁠-⁤⁦-⁩﻿]/g;

// Strong-signal override attempts. Kept narrow on purpose so ordinary personalities
// ("act as a grumpy pirate") and ordinary comments still pass.
const INJECTION_PATTERNS = [
  /\b(ignore|disregard|forget|override|bypass)\b[^.\n]{0,40}\b(instructions?|prompts?|rules?|guidelines?)\b/i,
  /\b(reveal|show|print|repeat|leak|output)\b[^.\n]{0,30}\b(system|hidden|initial|original)\s+(prompt|instructions?|message)\b/i,
  /\bsystem\s+prompt\b/i,
  /\b(new|updated|real)\s+instructions?\s*:/i,
  /\b(jailbreak|DAN\s+mode|developer\s+mode)\b/i,
];

/**
 * Removes anything that could fake structure in a prompt, collapses whitespace, caps length.
 * Everything ends up on one line, unless `keepLines` is set: then line breaks (and so bullet lists
 * and paragraphs) are kept, with at most one blank line in a row. Use that for longer, written text.
 */
export const cleanText = (value, { maxLength = 1000, keepLines = false } = {}) => {
  if (value === null || value === undefined) return "";
  const text = String(value)
    .normalize("NFKC")
    .replace(/\r\n?/g, "\n")
    .replace(INVISIBLE, " ")
    .replace(/<\|[^|>]*\|>/g, " ") // chat-template tokens like <|im_start|>
    .replace(/<\/?[a-zA-Z][^>]*>/g, " ") // tags: we use tags to fence off untrusted text
    .replace(/[<>]/g, " ")
    .replace(/\[\/?(INST|SYS)\]/gi, " ")
    .replace(/`{3,}/g, " ")
    // The next two only look at spaces within a line, so they can't pull one line into the one before it
    .replace(/^[^\S\n]*(system|assistant|user|human|developer)[^\S\n]*:/gim, "$1 -") // fake role headers
    .replace(/^[^\S\n]*#{1,6}[^\S\n]*/gm, "");
  const spaced = keepLines
    ? text.replace(/[^\S\n]+/g, " ").replace(/ ?\n ?/g, "\n").replace(/\n{3,}/g, "\n\n")
    : text.replace(/\s+/g, " ");
  return spaced.trim().slice(0, maxLength);
};

/** True if the text looks like an attempt to override the AI's instructions */
export const looksLikeInjection = (text) => INJECTION_PATTERNS.some((pattern) => pattern.test(text));

/** cleanText, but throws a 400 the user can act on if the text looks like an injection attempt */
export const assertSafeText = (value: unknown, label: string, options?: { maxLength?: number; keepLines?: boolean }) => {
  const cleaned = cleanText(value, options);
  // Check it as one line, so wording split across line breaks ("ignore\nyour instructions") can't slip through
  if (looksLikeInjection(cleaned.replace(/\s+/g, " "))) {
    throw new BadRequestError(
      `${label} contains wording we can't accept, because it looks like an attempt to change how the AI behaves. Please rephrase it.`
    );
  }
  return cleaned;
};

/** Accepts an array or a comma/newline separated string. Returns a clean, de-duplicated array. */
export const sanitizeTopicList = (input, { maxItems = 20, maxLength = 50, label = "Banned topics" } = {}) => {
  const items = Array.isArray(input) ? input : String(input ?? "").split(/[,;\n]/);
  const seen = new Set();
  const topics = [];
  for (const item of items) {
    const topic = assertSafeText(item, label, { maxLength });
    if (topic && !seen.has(topic.toLowerCase())) {
      seen.add(topic.toLowerCase());
      topics.push(topic);
    }
  }
  if (topics.length > maxItems) {
    throw new BadRequestError(`${label} can have at most ${maxItems} entries.`);
  }
  return topics;
};

/** Sanitizes every agent field that ends up in a prompt. Returns a cleaned copy. */
export const sanitizeAgentInput = (body: any = {}) => {
  const clean = { ...body };
  if ("firstName" in clean) clean.firstName = assertSafeText(clean.firstName, "First name", { maxLength: 50 });
  if ("lastName" in clean) clean.lastName = assertSafeText(clean.lastName, "Last name", { maxLength: 50 });

  if (clean.postSettings) {
    clean.postSettings = { ...clean.postSettings };
    if ("personality" in clean.postSettings) {
      // A written description: keep its paragraphs and bullet points
      clean.postSettings.personality = assertSafeText(clean.postSettings.personality, "Personality", { keepLines: true });
    }
    if ("bannedTopics" in clean.postSettings) {
      clean.postSettings.bannedTopics = sanitizeTopicList(clean.postSettings.bannedTopics);
    }
  }
  return clean;
};

