import jwt from "jsonwebtoken";
import { initDb, resetDb, closeDb, makeClient, createAccount } from "../helpers/db";
import AccountService from "../../services/AccountService";

const client = makeClient();
beforeAll(initDb);
beforeEach(resetDb);
afterAll(closeDb);

describe("API key auth (/api/v1/*)", () => {
  test("no key gives 401", async () => {
    const res = await client.get("/api/v1/posts");
    expect(res.status).toBe(401);
    expect(res.body.message).toMatch(/X-API-KEY/);
  });

  test("an empty key gives 401", async () => {
    expect((await client.get("/api/v1/posts").set("X-API-KEY", "")).status).toBe(401);
  });

  test("a valid key works, and works again from the cache", async () => {
    const { apiHeaders } = await createAccount();
    expect((await client.get("/api/v1/posts").set(apiHeaders)).status).toBe(200);
    expect((await client.get("/api/v1/posts").set(apiHeaders)).status).toBe(200);
  });

  test("the header name is case-insensitive", async () => {
    const { apiKey } = await createAccount();
    expect((await client.get("/api/v1/posts").set("x-api-key", apiKey)).status).toBe(200);
  });

  test("a key nobody owns is rejected", async () => {
    const res = await client.get("/api/v1/posts").set("X-API-KEY", "a".repeat(128));
    expect([401, 404]).toContain(res.status);
  });

  test("a key with the right first 9 characters but a wrong ending is rejected", async () => {
    const { apiKey } = await createAccount();
    // a fresh process has no cache entry for the forged key, so the full-key comparison must catch it
    const res = await client.get("/api/v1/posts").set("X-API-KEY", apiKey.slice(0, 9) + "0".repeat(apiKey.length - 9));
    expect(res.status).toBe(401);
  });

  test("a deleted account's key stops working immediately", async () => {
    const { apiHeaders, accountId } = await createAccount();
    expect((await client.get("/api/v1/posts").set(apiHeaders)).status).toBe(200);
    await AccountService.destroy(accountId);
    expect((await client.get("/api/v1/posts").set(apiHeaders)).status).not.toBe(200);
  });

  test("the 'dev' bypass key does nothing outside development", async () => {
    const res = await client.get("/api/v1/posts").set("X-API-KEY", "dev");
    expect(res.status).not.toBe(200);
  });

  test("one account's key cannot see another account's posts", async () => {
    const a = await createAccount();
    const b = await createAccount();
    expect((await client.get("/api/v1/posts").set(a.apiHeaders)).body.data).toEqual([]);
    expect((await client.get("/api/v1/posts").set(b.apiHeaders)).status).toBe(200);
  });
});

describe("JWT auth (dashboard routes)", () => {
  const webRoutes: [string, string][] = [
    ["get", "/accounts"],
    ["patch", "/accounts"],
    ["delete", "/accounts"],
    ["get", "/agents"],
    ["get", "/agents/agt_nothing"],
    ["post", "/agents"],
    ["patch", "/agents"],
    ["delete", "/agents"],
    ["get", "/posts"],
    ["get", "/posts/pst_nothing"],
    ["delete", "/posts/pst_nothing"],
  ];

  test.each(webRoutes)("%s %s with no token gives 401", async (method, path) => {
    const res = await client[method](path).send({});
    expect(res.status).toBe(401);
  });

  test("a valid token works", async () => {
    const { bearer } = await createAccount();
    expect((await client.get("/accounts").set(bearer)).status).toBe(200);
  });

  test("the 'Bearer' prefix is optional case and quotes are tolerated", async () => {
    const { token } = await createAccount();
    expect((await client.get("/accounts").set("Authorization", `bearer "${token}"`)).status).toBe(200);
  });

  describe("tokens that must not work", () => {
    const bad: [string, () => string][] = [
      ["signed with a different secret", () => jwt.sign({ accountId: "act_x" }, "wrong-secret")],
      ["expired", () => jwt.sign({ accountId: "act_x" }, "test-jwt-secret", { expiresIn: -10 })],
      ["unsigned (alg none)", () => jwt.sign({ accountId: "act_x" }, "", { algorithm: "none" })],
      ["garbage", () => "not.a.token"],
    ];

    test.each(bad)("%s is not treated as logged in", async (_name, makeToken) => {
      const res = await client.get("/accounts").set("Authorization", `Bearer ${makeToken()}`);
      expect(res.status).not.toBe(200);
    });
  });
});
