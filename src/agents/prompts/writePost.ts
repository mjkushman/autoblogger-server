/**
 * Step 3 of writing a post: the agent writes it. Replies with JSON in the shape of postSchema.json.
 * `notes` are web research (already cleaned). They are fenced in <research> tags, and the persona prompt says to treat that text as material.
 */
export const writePostPrompts = ({ topic, notes, maxWords }: { topic: string; notes: string; maxWords: number }): string[] => [
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
];
