import { postGraph } from "../../agents/postGraph";
import PostService from "../../services/PostService";
import { mockOpenAICreate, mockAxiosGet, fakePost } from "../helpers/mocks";

jest.mock("../../services/PostService", () => ({ __esModule: true, default: { findRecentTitles: jest.fn() } }));

const agent = { agentId: "agt_1", llm: { model: "gpt-5.4-mini", apiKey: "k" }, postSettings: {} };
const reply = (content: string) => ({ choices: [{ message: { content } }] });
const userText = (call) => call[0].messages.filter((m) => m.role === "user").map((m) => m.content).join("\n");

beforeEach(() => (PostService.findRecentTitles as jest.Mock).mockResolvedValue(["Old post"]));

describe("postGraph", () => {
  test("with a topic it goes straight to writing, then finds an image", async () => {
    const result = await postGraph.invoke({ agent, maxWords: 300, topic: "Why dogs sniff" });

    expect(mockOpenAICreate).toHaveBeenCalledTimes(1);
    expect(PostService.findRecentTitles).not.toHaveBeenCalled();
    expect(result).toMatchObject({ title: fakePost.title, content: fakePost.content, imageUrl: "https://images.test/photo.jpg" });
  });

  test("with no topic the agent decides one first, and writes about it", async () => {
    mockOpenAICreate.mockResolvedValueOnce(reply("Outline: the joy of fetch")).mockResolvedValueOnce(reply(JSON.stringify(fakePost)));

    const result = await postGraph.invoke({ agent, maxWords: 300, topic: null });

    expect(mockOpenAICreate).toHaveBeenCalledTimes(2);
    expect(userText(mockOpenAICreate.mock.calls[0])).toContain("Old post");
    expect(userText(mockOpenAICreate.mock.calls[1])).toContain("Outline: the joy of fetch");
    expect(result.topic).toBe("Outline: the joy of fetch");
  });

  test("a missing image does not stop the post", async () => {
    mockAxiosGet.mockRejectedValue(new Error("unsplash down"));

    const result = await postGraph.invoke({ agent, maxWords: 300, topic: "Why dogs sniff" });

    expect(result.title).toBe(fakePost.title);
    expect(result.imageUrl).toBeNull();
  });

  test("an incomplete post stops the graph before an image is searched", async () => {
    mockOpenAICreate.mockResolvedValue(reply(JSON.stringify({ tags: [] })));

    await expect(postGraph.invoke({ agent, maxWords: 300, topic: "x" })).rejects.toMatchObject({ status: 502 });
    expect(mockAxiosGet).not.toHaveBeenCalled();
  });
});
