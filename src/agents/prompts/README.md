# Prompts

Everything the agents say to the AI lives in this folder. One file per prompt:

| File | When it is used | The AI replies with |
|---|---|---|
| `persona.ts` | Every request: the agent's voice and rules (the "system prompt") | n/a |
| `decideTopic.ts` | Post step 1: choose what to write about | A short plain-text outline |
| `research.ts` | Post step 2: search the web for facts | Brief plain-text notes |
| `writePost.ts` | Post step 3: write the post | JSON in the shape of `postSchema.json` |
| `replyToComment.ts` | Replying to a reader's comment | Plain text |
| `postSchema.json` | The shape the post must come back in | n/a |

## Rules

* **Prompts are plain functions.** They take values in and return text. No database, no network, no AI calls. That keeps them easy to read and test.
* **Clean strangers' text before it goes in.** Anything a visitor typed, or that came from the web, must go through `cleanText` before reaching a prompt, and sits inside a labelled tag (`<comment>`, `<post>`, `<research>`). `persona.ts` tells the AI that text inside those tags is material to work from, never instructions. If you add a new tag, add it there too.
* **Change wording here, not in the code that calls it.**

## Changing a prompt

1. Edit the file.
2. Run `npx jest prompts -u`. This rewrites `src/__tests__/unit/__snapshots__/prompts.test.ts.snap`, which holds the full text of every prompt.
3. Commit both. In the pull request, the `.snap` diff is the exact before-and-after of what the AI will be told.
