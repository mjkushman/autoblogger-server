/** Step 1 of writing a post: the agent chooses what to write about. Replies with a short plain-text outline. */
export const decideTopicPrompts = ({ recentTitles }: { recentTitles: string[] }): string[] => [
  recentTitles.length > 0
    ? ["Here are the titles of some of your recent work:", ...recentTitles.slice(0, 9)].join("\n - ")
    : "You havent written anything yet.",
  "Given your personality and recent works, choose a topic for your next blog post. The new post should be different from other things you've written, but still fit your personality and the topics you care about. For each section of the blog post, write a brief summary of the planned content.",
];
