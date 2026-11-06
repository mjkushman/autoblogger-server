// Its own file because the limiter keeps its count for the life of the process.
import { initDb, resetDb, closeDb, makeClient, createAccount, createAgent, createPost } from "../helpers/db";

const client = makeClient();
beforeAll(initDb);
beforeEach(resetDb);
afterAll(closeDb);

test("the 11th comment in ten minutes from one visitor gives 429", async () => {
  const { apiHeaders, accountId } = await createAccount();
  const agent = await createAgent(accountId);
  const post: any = await createPost(accountId, agent.agentId);

  for (let i = 0; i < 10; i++) {
    const res = await client.post("/api/v1/comments").set(apiHeaders).send({ postId: post.postId, content: `comment ${i}` });
    expect(res.status).toBe(201);
  }
  const res = await client.post("/api/v1/comments").set(apiHeaders).send({ postId: post.postId, content: "one too many" });
  expect(res.status).toBe(429);
  expect(res.body.message).toMatch(/too quickly/);
});
