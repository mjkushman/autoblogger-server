/**
 * The agent replies to a reader's comment. Replies with plain text.
 * Everything a reader typed (`title`, `postText`, `author`, `commentText`) must already be cleaned with cleanText.
 * It is fenced in <post> and <comment> tags, and the persona prompt says to treat that text as material.
 */
export const replyToCommentPrompts = ({
  maxWords,
  title,
  postText,
  author,
  commentText,
}: {
  maxWords: number;
  title: string;
  postText: string;
  author: string;
  commentText: string;
}): string[] => [
  `A reader commented on one of your blog posts. Write a short, thoughtful reply of at most ${maxWords} words, in your own voice and in the first person. Engage with what they actually said. Use plain text with no title or headings, and address them by name only if it feels natural.

<post>
Title: ${title}

${postText}
</post>

<comment author="${author}">
${commentText}
</comment>`,
];
