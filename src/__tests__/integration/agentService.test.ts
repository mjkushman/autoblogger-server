import { initDb, resetDb, closeDb, createAccount, createAgent, createPost, agentBody, Post, Agent } from "../helpers/db";
import { mockCronSchedule, mockOpenAICreate, providerError } from "../helpers/mocks";
import AgentService from "../../services/AgentService";
import AgentScheduler from "../../services/AgentScheduler";

let accountId: string;
beforeAll(initDb);
beforeEach(async () => {
  await resetDb();
  ({ accountId } = await createAccount());
});
afterAll(closeDb);

const settings = (overrides: Record<string, any> = {}) => ({ ...agentBody().postSettings, ...overrides });
const lastTask = () => mockCronSchedule.mock.results[mockCronSchedule.mock.results.length - 1].value;

describe("AgentService.create", () => {
  test("encodes the schedule, saves the agent and does not touch the caller's body keys", async () => {
    const agent: any = await AgentService.create({ accountId, body: agentBody() });
    expect(agent.postSettings.cronSchedule).toBe("30 09 * * mon,wed");
    expect(agent.accountId).toBe(accountId);
  });

  test("schedules a cron task in the agent's timezone when enabled", async () => {
    const agent: any = await AgentService.create({ accountId, body: agentBody({ postSettings: settings({ isEnabled: true }) }) });
    expect(mockCronSchedule).toHaveBeenCalledTimes(1);
    const [expression, , options] = mockCronSchedule.mock.calls[0];
    expect(expression).toBe("30 09 * * mon,wed");
    expect(options).toEqual({ timezone: "America/New_York", name: agent.agentId });
  });

  test("schedules nothing when disabled", async () => {
    await AgentService.create({ accountId, body: agentBody() });
    expect(mockCronSchedule).not.toHaveBeenCalled();
  });

  test("an invalid schedule saves nothing", async () => {
    await expect(AgentService.create({ accountId, body: agentBody({ postSettings: settings({ time: "99:99" }) }) })).rejects.toMatchObject({ status: 400 });
  });
});

describe("AgentService.update", () => {
  test("changed settings replace the running task", async () => {
    const agent: any = await AgentService.create({ accountId, body: agentBody({ postSettings: settings({ isEnabled: true }) }) });
    const first = lastTask();

    await AgentService.update({ accountId, agentId: agent.agentId, body: { postSettings: settings({ isEnabled: true, time: "18:00" }) } });

    expect(first.stop).toHaveBeenCalled();
    expect(mockCronSchedule).toHaveBeenCalledTimes(2);
    expect(mockCronSchedule.mock.calls[1][0]).toBe("00 18 * * mon,wed");
  });

  test("settings that did not change leave the task alone", async () => {
    const agent: any = await AgentService.create({ accountId, body: agentBody({ postSettings: settings({ isEnabled: true }) }) });
    const task = lastTask();
    await AgentService.update({ accountId, agentId: agent.agentId, body: { postSettings: settings({ isEnabled: true }), lastName: "Newname" } });
    expect(task.stop).not.toHaveBeenCalled();
    expect(mockCronSchedule).toHaveBeenCalledTimes(1);
  });

  test("disabling stops the task and does not start another", async () => {
    const agent: any = await AgentService.create({ accountId, body: agentBody({ postSettings: settings({ isEnabled: true }) }) });
    const task = lastTask();
    await AgentService.update({ accountId, agentId: agent.agentId, body: { postSettings: settings({ isEnabled: false }) } });
    expect(task.stop).toHaveBeenCalled();
    expect(mockCronSchedule).toHaveBeenCalledTimes(1);
  });

  test("enabling a disabled agent starts a task", async () => {
    const agent: any = await AgentService.create({ accountId, body: agentBody() });
    await AgentService.update({ accountId, agentId: agent.agentId, body: { postSettings: settings({ isEnabled: true }) } });
    expect(mockCronSchedule).toHaveBeenCalledTimes(1);
  });

  test("an unknown agent gives 404", async () => {
    await expect(AgentService.update({ accountId, agentId: "agt_nothing", body: { postSettings: settings() } })).rejects.toMatchObject({ status: 404 });
  });
});

describe("AgentService.delete", () => {
  test("stops the running task and removes the agent", async () => {
    const agent: any = await AgentService.create({ accountId, body: agentBody({ postSettings: settings({ isEnabled: true }) }) });
    const task = lastTask();
    await expect(AgentService.delete({ accountId, agentId: agent.agentId })).resolves.toEqual({ message: "Delete successful" });
    expect(task.stop).toHaveBeenCalled();
    expect(await AgentService.findOne({ accountId, agentId: agent.agentId })).toBeNull();
  });

  test("a second delete gives 404", async () => {
    const agent: any = await AgentService.create({ accountId, body: agentBody() });
    await AgentService.delete({ accountId, agentId: agent.agentId });
    await expect(AgentService.delete({ accountId, agentId: agent.agentId })).rejects.toMatchObject({ status: 404 });
  });
});

describe("AgentScheduler.loadActive (server start)", () => {
  test("schedules every enabled agent and skips disabled ones", async () => {
    const on = await createAgent(accountId, { postSettings: settings({ isEnabled: true, cronSchedule: "0 8 * * mon" }) });
    await createAgent(accountId, { postSettings: settings({ isEnabled: false }) });
    await createAgent(accountId, { postSettings: settings({ isEnabled: true, cronSchedule: "0 9 * * tue" }) });

    await AgentScheduler.loadActive();

    expect(mockCronSchedule).toHaveBeenCalledTimes(2);
    expect(mockCronSchedule.mock.calls.map((c) => c[0]).sort()).toEqual(["0 8 * * mon", "0 9 * * tue"]);
    expect(mockCronSchedule.mock.calls.map((c) => c[2].name)).toContain(on.agentId);
  });
});

describe("a scheduled run", () => {
  const scheduleAndGetCallback = async (extra: Record<string, any> = {}) => {
    const agent: any = await AgentService.create({ accountId, body: agentBody({ postSettings: settings({ isEnabled: true }), ...extra }) });
    return { agent, run: mockCronSchedule.mock.calls[0][1] as () => Promise<void> };
  };

  test("writes a post with a chosen topic and saves it", async () => {
    const { agent, run } = await scheduleAndGetCallback();
    await run();
    const saved: any = await Post.findOne({ where: { agentId: agent.agentId } });
    expect(saved.title).toBe("A Test Title");
    expect(mockOpenAICreate).toHaveBeenCalledTimes(2); // one call to pick a topic, one to write
  });

  test("a failed run does not throw", async () => {
    const { run } = await scheduleAndGetCallback();
    mockOpenAICreate.mockRejectedValue(providerError(429));
    await expect(run()).resolves.toBeUndefined();
  });

  test("a failed run saves nothing", async () => {
    const { run } = await scheduleAndGetCallback();
    mockOpenAICreate.mockRejectedValue(providerError(429));
    await run().catch(() => {});
    expect(await Post.count()).toBe(0);
  });

  test("a failed run says which agent failed, and why", async () => {
    const { agent, run } = await scheduleAndGetCallback();
    const errors = console.error as jest.Mock;
    errors.mockClear();
    mockOpenAICreate.mockRejectedValue(providerError(429));
    await run();
    const logged = errors.mock.calls.find((c) => String(c[0]).startsWith("Scheduled post failed"));
    expect(logged[0]).toContain(agent.username);
    expect(logged[0]).toContain(agent.agentId);
  });
});

describe("bring your own key: agents that would post with no key", () => {
  const noKey = { model: "gpt-5.4-mini", apiKey: null };

  test("creating an agent with posting on and no key is refused, and saves nothing", async () => {
    await expect(AgentService.create({ accountId, body: agentBody({ llm: noKey, postSettings: settings({ isEnabled: true }) }) })).rejects.toMatchObject({
      status: 400,
      message: expect.stringMatching(/Add an API key/),
    });
    expect(await Agent.count()).toBe(0);
    expect(mockCronSchedule).not.toHaveBeenCalled();
  });

  test("a blank key counts as no key", async () => {
    await expect(
      AgentService.create({ accountId, body: agentBody({ llm: { model: "gpt-5.4-mini", apiKey: "   " }, postSettings: settings({ isEnabled: true }) }) })
    ).rejects.toMatchObject({ status: 400 });
  });

  test("an agent with no key can still be created while posting is off", async () => {
    const agent: any = await AgentService.create({ accountId, body: agentBody({ llm: noKey, postSettings: settings({ isEnabled: false }) }) });
    expect(agent.agentId).toBeTruthy();
    expect(mockCronSchedule).not.toHaveBeenCalled();
  });

  test("turning posting on for an agent with no key is refused, and nothing changes", async () => {
    const agent: any = await createAgent(accountId, { llm: noKey, postSettings: settings({ isEnabled: false }) });
    await expect(AgentService.update({ accountId, agentId: agent.agentId, body: { postSettings: settings({ isEnabled: true }) } })).rejects.toMatchObject({ status: 400 });
    expect(((await Agent.findByPk(agent.agentId)) as any).postSettings.isEnabled).toBe(false);
    expect(mockCronSchedule).not.toHaveBeenCalled();
  });

  test("adding a key and turning posting on in the same update works", async () => {
    const agent: any = await createAgent(accountId, { llm: noKey, postSettings: settings({ isEnabled: false }) });
    await AgentService.update({
      accountId,
      agentId: agent.agentId,
      body: { llm: { model: "gpt-5.4-mini", apiKey: "sk-new" }, postSettings: settings({ isEnabled: true }) },
    });
    expect(mockCronSchedule).toHaveBeenCalledTimes(1);
  });

  test("removing the key from an agent that is posting is refused", async () => {
    const agent: any = await AgentService.create({ accountId, body: agentBody({ postSettings: settings({ isEnabled: true }) }) });
    await expect(AgentService.update({ accountId, agentId: agent.agentId, body: { llm: noKey } })).rejects.toMatchObject({ status: 400 });
    expect(((await Agent.findByPk(agent.agentId)) as any).llm.apiKey).toBe("sk-agent-secret");
  });

  test("an unrelated edit to an older agent that is already posting with no key still goes through", async () => {
    const agent: any = await createAgent(accountId, { llm: noKey, postSettings: settings({ isEnabled: true }) });
    await AgentService.update({ accountId, agentId: agent.agentId, body: { lastName: "Newname" } });
    expect(((await Agent.findByPk(agent.agentId)) as any).lastName).toBe("Newname");
  });

  test("server start warns about each scheduled agent with no key, and still schedules it so adding a key later works", async () => {
    const keyless = await createAgent(accountId, { llm: noKey, postSettings: settings({ isEnabled: true, cronSchedule: "0 8 * * mon" }) });
    await createAgent(accountId, { postSettings: settings({ isEnabled: true, cronSchedule: "0 9 * * tue" }) });
    const warn = jest.spyOn(console, "warn").mockImplementation(() => {});

    await AgentScheduler.loadActive();

    expect(mockCronSchedule).toHaveBeenCalledTimes(2);
    expect(warn).toHaveBeenCalledTimes(1);
    expect(warn.mock.calls[0][0]).toContain(keyless.agentId);
    expect(warn.mock.calls[0][0]).toMatch(/no API key/);
    warn.mockRestore();
  });
});

describe("AgentService.findOneByPostId", () => {
  test("returns the agent that wrote the post", async () => {
    const agent = await createAgent(accountId);
    const post: any = await createPost(accountId, agent.agentId);
    expect((await AgentService.findOneByPostId({ postId: post.postId })).agentId).toBe(agent.agentId);
  });

  test("an unknown post gives 404", async () => {
    await expect(AgentService.findOneByPostId({ postId: "pst_nothing" })).rejects.toMatchObject({ status: 404 });
  });
});
