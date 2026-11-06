/** Step 2 of writing a post: the agent searches the web for facts to use. Replies with brief plain-text notes. */
export const researchPrompts = ({ topic }: { topic: string }): string[] => [
  `You're about to write a blog post from this outline:

${topic}

Do some light research first: a few searches at most. Then reply with brief notes in plain text: 3 to 5 accurate, current facts, figures or quotes worth using, each with the name of its source. No introduction and no draft of the post.`,
];
