import { initDb, resetDb, closeDb, makeClient, createAccount, createAgent, createPost, agentBody, Account, Agent, Status } from "../helpers/db";

const client = makeClient();
beforeAll(initDb);
beforeEach(resetDb);
afterAll(closeDb);

const registration = (overrides = {}) => ({
  email: "new@test.com",
  firstName: "New",
  lastName: "Person",
  password: "password123",
  host: "https://site.test",
  ...overrides,
});

describe("POST /accounts (register)", () => {
  test("creates an account and returns a working token", async () => {
    const res = await client.post("/accounts").send(registration());
    expect(res.status).toBe(201);
    const me = await client.get("/accounts").set("Authorization", `Bearer ${res.body.data}`);
    expect(me.status).toBe(200);
    expect(me.body.data.email).toBe("new@test.com");
  });

  test("hashes the password and creates an API key", async () => {
    await client.post("/accounts").send(registration());
    const saved: any = await Account.findOne({ where: { email: "new@test.com" } });
    expect(saved.password).not.toBe("password123");
    expect(saved.apiKey).toHaveLength(128);
    expect(saved.apiKeyIndex).toBe(saved.apiKey.slice(0, 9));
  });

  test("the new API key works right away", async () => {
    await client.post("/accounts").send(registration());
    const saved: any = await Account.findOne({ where: { email: "new@test.com" } });
    expect((await client.get("/api/v1/posts").set("X-API-KEY", saved.apiKey)).status).toBe(200);
  });

  test("a duplicate email gives 400", async () => {
    await client.post("/accounts").send(registration());
    expect((await client.post("/accounts").send(registration())).status).toBe(400);
  });

  test("a missing email gives 400", async () => {
    const { email, ...body } = registration();
    expect((await client.post("/accounts").send(body)).status).toBe(400);
  });
});

describe("GET /accounts", () => {
  test("returns the account without its password hash, and includes its agents", async () => {
    const { bearer, accountId } = await createAccount();
    await createAgent(accountId);
    const res = await client.get("/accounts").set(bearer);
    expect(res.body.data.accountId).toBe(accountId);
    expect(res.body.data.password).toBeUndefined();
    expect(res.body.data.Agents).toHaveLength(1);
  });
});

describe("PATCH /accounts", () => {
  test("updates name fields", async () => {
    const { bearer } = await createAccount();
    const res = await client.patch("/accounts").set(bearer).send({ firstName: "Renamed" });
    expect(res.body.data.firstName).toBe("Renamed");
    expect(res.body.data.password).toBeUndefined();
  });

  test("ignores accountId and apiKey", async () => {
    const { bearer, accountId, apiKey } = await createAccount();
    await client.patch("/accounts").set(bearer).send({ accountId: "act_hacked", apiKey: "stolen", apiKeyIndex: "stolen" });
    const saved: any = await Account.findByPk(accountId);
    expect(saved.apiKey).toBe(apiKey);
  });

  test("a changed password is re-hashed and works for login", async () => {
    const { bearer, account } = await createAccount();
    await client.patch("/accounts").set(bearer).send({ password: "brand-new-pass" });
    expect((await client.post("/auth").send({ email: account.email, password: "brand-new-pass" })).status).toBe(201);
    expect((await client.post("/auth").send({ email: account.email, password: "password123" })).status).toBe(401);
  });
});

describe("DELETE /accounts", () => {
  test("deletes the account", async () => {
    const { bearer, accountId } = await createAccount();
    expect((await client.delete("/accounts").set(bearer)).status).toBe(200);
    expect(await Account.findByPk(accountId)).toBeNull();
  });
});

describe("POST /auth (login)", () => {
  test("returns a token for the right password", async () => {
    const { account } = await createAccount();
    const res = await client.post("/auth").send({ email: account.email, password: "password123" });
    expect(res.status).toBe(201);
    expect((await client.get("/accounts").set("Authorization", `Bearer ${res.body.data}`)).status).toBe(200);
  });

  test("a wrong password gives 401", async () => {
    const { account } = await createAccount();
    expect((await client.post("/auth").send({ email: account.email, password: "nope" })).status).toBe(401);
  });

  test("an unknown email gives 404", async () => {
    expect((await client.post("/auth").send({ email: "ghost@test.com", password: "x" })).status).toBe(404);
  });

  test("a missing email or password gives 400", async () => {
    expect((await client.post("/auth").send({ email: "a@b.com" })).status).toBe(400);
    expect((await client.post("/auth").send({ password: "x" })).status).toBe(400);
  });
});

describe("/agents (dashboard)", () => {
  test("creates an agent for the logged-in account", async () => {
    const { bearer, accountId } = await createAccount();
    const res = await client.post("/agents").set(bearer).send(agentBody());
    expect(res.status).toBe(201);
    expect(res.body.data.accountId).toBe(accountId);
  });

  test("settings missing a time, days or timezone give 400", async () => {
    const { bearer } = await createAccount();
    const body = agentBody();
    delete body.postSettings.timezone;
    expect((await client.post("/agents").set(bearer).send(body)).status).toBe(400);
  });

  test("lists and gets only the account's own agents", async () => {
    const a = await createAccount();
    const b = await createAccount();
    const mine = await createAgent(a.accountId);
    const theirs = await createAgent(b.accountId);
    expect((await client.get("/agents").set(a.bearer)).body.data.map((x) => x.agentId)).toEqual([mine.agentId]);
    expect((await client.get(`/agents/${mine.agentId}`).set(a.bearer)).body.data.agentId).toBe(mine.agentId);
    expect((await client.get(`/agents/${theirs.agentId}`).set(a.bearer)).status).toBe(404);
  });

  test("patches by agentId in the body; another account's agent gives 404", async () => {
    const a = await createAccount();
    const b = await createAccount();
    const mine = await createAgent(a.accountId);
    const theirs = await createAgent(b.accountId);
    const { postSettings } = agentBody();
    const ok = await client.patch("/agents").set(a.bearer).send({ agentId: mine.agentId, authorBio: "Updated", postSettings });
    expect(ok.status).toBe(200);
    const denied = await client.patch("/agents").set(a.bearer).send({ agentId: theirs.agentId, authorBio: "Hacked", postSettings });
    expect(denied.status).toBe(404);
  });

  test("deletes by agentId in the body; another account's agent survives", async () => {
    const a = await createAccount();
    const b = await createAccount();
    const mine = await createAgent(a.accountId);
    const theirs = await createAgent(b.accountId);
    expect((await client.delete("/agents").set(a.bearer).send({ agentId: theirs.agentId })).status).toBe(404);
    expect((await client.delete("/agents").set(a.bearer).send({ agentId: mine.agentId })).status).toBe(200);
    expect(await Agent.count()).toBe(1);
  });
});

describe("/posts (dashboard)", () => {
  test("lists the account's posts and can filter by agent", async () => {
    const { bearer, accountId } = await createAccount();
    const one = await createAgent(accountId);
    const two = await createAgent(accountId);
    await createPost(accountId, one.agentId);
    await createPost(accountId, two.agentId);
    expect((await client.get("/posts").set(bearer)).body.data).toHaveLength(2);
    expect((await client.get(`/posts?agentId=${one.agentId}`).set(bearer)).body.data).toHaveLength(1);
  });

  test("gets one post; another account's post gives 404", async () => {
    const a = await createAccount();
    const b = await createAccount();
    const agent = await createAgent(b.accountId);
    const post: any = await createPost(b.accountId, agent.agentId);
    expect((await client.get(`/posts/${post.postId}`).set(b.bearer)).status).toBe(200);
    expect((await client.get(`/posts/${post.postId}`).set(a.bearer)).status).toBe(404);
  });

  test("deletes only the account's own post", async () => {
    const a = await createAccount();
    const b = await createAccount();
    const agent = await createAgent(b.accountId);
    const post: any = await createPost(b.accountId, agent.agentId);
    expect((await client.delete(`/posts/${post.postId}`).set(a.bearer)).status).toBe(404);
    expect((await client.delete(`/posts/${post.postId}`).set(b.bearer)).status).toBe(200);
  });

  test("generates and saves a post for the agent", async () => {
    const { bearer, accountId } = await createAccount();
    const agent = await createAgent(accountId);
    const res = await client.post("/posts").set(bearer).send({ agentId: agent.agentId });
    expect(res.status).toBe(200);
    expect((await client.get("/posts").set(bearer)).body.data).toHaveLength(1);
  });
});

describe("/status", () => {
  test("returns a status by id", async () => {
    const status: any = await Status.create({ type: "post", status: "in_progress" });
    const res = await client.get(`/status/${status.statusId}`);
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("in_progress");
  });

  test("an unknown id gives 404", async () => {
    expect((await client.get("/status/sts_nothing")).status).toBe(404);
  });

  test("with no id, explains how to use it", async () => {
    expect((await client.get("/status")).body.message).toMatch(/status ID/);
  });
});

describe("the app", () => {
  test("GET / says welcome", async () => {
    expect((await client.get("/")).text).toBe("Welcome to autoblogger");
  });

  test("/api.json serves the OpenAPI spec", async () => {
    const res = await client.get("/api.json");
    expect(res.status).toBe(200);
    expect(res.body.openapi).toBeDefined();
    expect(Object.keys(res.body.paths)).toEqual(expect.arrayContaining(["/posts", "/comments"]));
  });

  test("an unknown path gives a 404 in the standard error shape", async () => {
    const res = await client.get("/nope");
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ status: "Error", message: "Not Found" });
  });

  test("errors never leak a stack trace", async () => {
    const res = await client.get("/api/v1/posts");
    expect(JSON.stringify(res.body)).not.toMatch(/at .*\.ts/);
  });
});
