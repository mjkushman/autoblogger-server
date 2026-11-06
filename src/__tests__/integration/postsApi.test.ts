import { initDb, resetDb, closeDb, makeClient, createAccount, createAgent, createPost, waitForStatus, Post, Comment } from "../helpers/db";
import { mockOpenAICreate, mockAxiosGet, providerError } from "../helpers/mocks";

const client = makeClient();
beforeAll(initDb);
beforeEach(resetDb);
afterAll(closeDb);

const base = "/api/v1/posts";

describe("GET /posts", () => {
  test("lists only the caller's posts", async () => {
    const a = await createAccount();
    const b = await createAccount();
    const agentA = await createAgent(a.accountId);
    const agentB = await createAgent(b.accountId);
    await createPost(a.accountId, agentA.agentId);
    await createPost(a.accountId, agentA.agentId);
    await createPost(b.accountId, agentB.agentId);

    const res = await client.get(base).set(a.apiHeaders);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.every((p) => p.accountId === a.accountId)).toBe(true);
  });

  test("comments are left out by default", async () => {
    const { apiHeaders, accountId } = await createAccount();
    const agent = await createAgent(accountId);
    const post: any = await createPost(accountId, agent.agentId);
    await Comment.create({ accountId, postId: post.postId, authorName: "Sam", content: "Nice" });
    expect((await client.get(base).set(apiHeaders)).body.data[0].comments).toBeUndefined();
  });

  test("?comments=true includes comments", async () => {
    const { apiHeaders, accountId } = await createAccount();
    const agent = await createAgent(accountId);
    const post: any = await createPost(accountId, agent.agentId);
    await Comment.create({ accountId, postId: post.postId, authorName: "Sam", content: "Nice" });
    const res = await client.get(`${base}?comments=true`).set(apiHeaders);
    expect(res.body.data[0].comments).toHaveLength(1);
  });

  test("?comments=false leaves comments out", async () => {
    const { apiHeaders, accountId } = await createAccount();
    const agent = await createAgent(accountId);
    const post: any = await createPost(accountId, agent.agentId);
    await Comment.create({ accountId, postId: post.postId, authorName: "Sam", content: "Nice" });
    expect((await client.get(`${base}?comments=false`).set(apiHeaders)).body.data[0].comments).toBeUndefined();
  });

  test("a post gets a slug from its title", async () => {
    const { apiHeaders, accountId } = await createAccount();
    const agent = await createAgent(accountId);
    await createPost(accountId, agent.agentId, { title: "Hello Big World" });
    expect((await client.get(base).set(apiHeaders)).body.data[0].slug).toBe("hello-big-world");
  });
});

describe("GET /posts/:id", () => {
  test("returns the post", async () => {
    const { apiHeaders, accountId } = await createAccount();
    const agent = await createAgent(accountId);
    const post: any = await createPost(accountId, agent.agentId, { title: "Mine" });
    const res = await client.get(`${base}/${post.postId}`).set(apiHeaders);
    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Mine");
  });

  test("a missing post gives 404", async () => {
    const { apiHeaders } = await createAccount();
    expect((await client.get(`${base}/pst_nothing`).set(apiHeaders)).status).toBe(404);
  });

  test("another account's post gives 404", async () => {
    const a = await createAccount();
    const b = await createAccount();
    const agent = await createAgent(b.accountId);
    const post: any = await createPost(b.accountId, agent.agentId);
    expect((await client.get(`${base}/${post.postId}`).set(a.apiHeaders)).status).toBe(404);
  });
});

describe("DELETE /posts/:id", () => {
  test("deletes the caller's post and its comments", async () => {
    const { apiHeaders, accountId } = await createAccount();
    const agent = await createAgent(accountId);
    const post: any = await createPost(accountId, agent.agentId);
    await Comment.create({ accountId, postId: post.postId, authorName: "Sam", content: "Nice" });

    expect((await client.delete(`${base}/${post.postId}`).set(apiHeaders)).status).toBe(200);
    expect(await Post.count()).toBe(0);
    expect(await Comment.count()).toBe(0);
  });

  test("another account's post gives 404 and survives", async () => {
    const a = await createAccount();
    const b = await createAccount();
    const agent = await createAgent(b.accountId);
    const post: any = await createPost(b.accountId, agent.agentId);
    expect((await client.delete(`${base}/${post.postId}`).set(a.apiHeaders)).status).toBe(404);
    expect(await Post.count()).toBe(1);
  });
});

describe("POST /posts (generate)", () => {
  test("answers at once with a status, then saves the post and marks the status a success", async () => {
    const { apiHeaders, accountId } = await createAccount();
    const agent = await createAgent(accountId);

    const res = await client.post(base).set(apiHeaders).send({ agentId: agent.agentId, options: { topic: "Walks" } });
    expect(res.status).toBe(201);
    expect(res.body.data.statusId).toMatch(/^sts_/);

    const status = await waitForStatus(res.body.data.statusId);
    expect(status.status).toBe("success");
    expect(status.result.post.title).toBe("A Test Title");

    const saved: any = await Post.findOne({ where: { accountId } });
    expect(saved).toMatchObject({ title: "A Test Title", agentId: agent.agentId, authorId: agent.agentId, imageUrl: "https://images.test/photo.jpg" });
  });

  test("the status can be polled through the status route", async () => {
    const { apiHeaders, accountId } = await createAccount();
    const agent = await createAgent(accountId);
    const res = await client.post(base).set(apiHeaders).send({ agentId: agent.agentId });
    await waitForStatus(res.body.data.statusId);
    const poll = await client.get(`/status/${res.body.data.statusId}`);
    expect(poll.body.data.status).toBe("success");
  });

  test("a failing LLM marks the status as an error and saves nothing", async () => {
    const { apiHeaders, accountId } = await createAccount();
    const agent = await createAgent(accountId);
    mockOpenAICreate.mockRejectedValue(providerError(401));

    const res = await client.post(base).set(apiHeaders).send({ agentId: agent.agentId, options: { topic: "x" } });
    const status = await waitForStatus(res.body.data.statusId);
    expect(status.status).toBe("error");
    expect(await Post.count()).toBe(0);
  });

  test("a post is still saved when Unsplash is down", async () => {
    const { apiHeaders, accountId } = await createAccount();
    const agent = await createAgent(accountId);
    mockAxiosGet.mockRejectedValue(new Error("unsplash down"));

    const res = await client.post(base).set(apiHeaders).send({ agentId: agent.agentId, options: { topic: "x" } });
    expect((await waitForStatus(res.body.data.statusId)).status).toBe("success");
    expect(((await Post.findOne({ where: { accountId } })) as any).imageUrl).toBeNull();
  });

  test("a missing agentId gives 401", async () => {
    const { apiHeaders } = await createAccount();
    expect((await client.post(base).set(apiHeaders).send({})).status).toBe(401);
  });

  test("another account's agent gives 401 and never calls the LLM", async () => {
    const a = await createAccount();
    const b = await createAccount();
    const agent = await createAgent(b.accountId);
    const res = await client.post(base).set(a.apiHeaders).send({ agentId: agent.agentId });
    expect(res.status).toBe(401);
    expect(mockOpenAICreate).not.toHaveBeenCalled();
  });
});
