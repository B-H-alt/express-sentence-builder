import { expect, test } from "@playwright/test";
import { EventEmitter } from "node:events";
import handler from "../../api/speak";

test("speech endpoint forwards the first chunk before generation completes", async () => {
  const previousFetch = globalThis.fetch;
  const keys = ["SUPABASE_URL", "SUPABASE_PUBLISHABLE_KEY", "ELEVENLABS_API_KEY"] as const;
  const previous = keys.map(key => process.env[key]);
  process.env.SUPABASE_URL = "https://auth.example.test";
  process.env.SUPABASE_PUBLISHABLE_KEY = "test-public";
  process.env.ELEVENLABS_API_KEY = "test-only";
  let releaseTail: () => void = () => {};
  let firstChunk: () => void = () => {};
  const forwarded = new Promise<void>(resolve => { firstChunk = resolve; });
  const tail = new Promise<void>(resolve => { releaseTail = resolve; });
  let upstream = "";
  globalThis.fetch = async (input) => {
    if (String(input).includes("consume_feature_usage")) return new Response(JSON.stringify({ allowed: true }));
    upstream = String(input);
    return new Response(new ReadableStream({
      async start(stream) {
        stream.enqueue(new Uint8Array([1, 2]));
        await tail;
        stream.enqueue(new Uint8Array([3, 4]));
        stream.close();
      },
    }), { headers: { "Content-Type": "audio/mpeg" } });
  };
  const chunks: number[][] = [];
  const headers: Record<string, string> = {};
  let ended = false;
  let status = 0;
  const response = Object.assign(new EventEmitter(), {
    setHeader(name: string, value: string) { headers[name] = value; },
    status(code: number) { status = code; return this; },
    json() { throw new Error("Unexpected JSON response"); },
    write(chunk: Uint8Array) { chunks.push([...chunk]); firstChunk(); return true; },
    end() { ended = true; },
    destroy() { throw new Error("Unexpected stream failure"); },
  });
  try {
    const pending = handler({ method: "POST", headers: { authorization: "Bearer test-session" }, body: { text: "I want water." } }, response);
    await forwarded;
    expect(ended).toBe(false);
    expect(chunks).toEqual([[1, 2]]);
    expect(upstream).toMatch(/\/stream$/);
    releaseTail();
    await pending;
    expect(status).toBe(200);
    expect(chunks).toEqual([[1, 2], [3, 4]]);
    expect(ended).toBe(true);
    expect(headers["Cache-Control"]).toContain("no-store");
    expect(headers["Content-Length"]).toBeUndefined();
  } finally {
    releaseTail();
    globalThis.fetch = previousFetch;
    keys.forEach((key, i) => { if (previous[i] === undefined) delete process.env[key]; else process.env[key] = previous[i]; });
  }
});

test("streaming speech still rejects a signed-out request", async () => {
  let status = 0;
  let body: unknown;
  let streamed = false;
  const response = Object.assign(new EventEmitter(), {
    setHeader() {},
    status(code: number) { status = code; return this; },
    json(value: unknown) { body = value; },
    write() { streamed = true; return true; }, end() {}, destroy() {},
  });
  await handler({ method: "POST", headers: {}, body: { text: "I want water." } }, response);
  expect(status).toBe(401);
  expect(body).toEqual({ error: "Sign in is required." });
  expect(streamed).toBe(false);
});
