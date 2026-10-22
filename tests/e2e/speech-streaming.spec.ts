import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";
import { blockThirdPartyWidgets } from "./helpers";

test("streamed MP3 starts before the final audio arrives; buffered playback waits", async ({ page }, testInfo) => {
  await blockThirdPartyWidgets(page);
  await page.goto("/");
  const fixture = (await readFile("tests/fixtures/speech-tone.mp3")).toString("base64");
  const result = await page.evaluate(async encoded => {
    const { playSpeechResponse } = await import("/src/utils/stream-speech.ts");
    const { playAudioToEnd } = await import("/src/utils/play-audio.ts");
    const sample = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    // Repeat valid MP3 frames to represent a sentence-length clip. The original
    // test effect is too short for Chromium's initial media buffering threshold.
    const bytes = new Uint8Array(sample.length * 16);
    for (let index = 0; index < 16; index++) bytes.set(sample, index * sample.length);
    const run = async (streaming: boolean) => {
      const audio = new Audio();
      audio.muted = true;
      const controller = new AbortController();
      const safety = setTimeout(() => controller.abort(), 8_000);
      const startedAt = performance.now();
      let firstPlay = 0;
      let downloadFinished = 0;
      audio.addEventListener("playing", () => { firstPlay ||= performance.now() - startedAt; });
      const response = new Response(new ReadableStream({
        start(stream) {
          // Deliver enough valid MP3 frames to play, withholding the final frames.
          stream.enqueue(bytes.slice(0, Math.floor(bytes.length * 0.75)));
          setTimeout(() => {
            stream.enqueue(bytes.slice(Math.floor(bytes.length * 0.75)));
            stream.close();
          }, 1_200);
        },
      }), { headers: { "Content-Type": "audio/mpeg" } });
      let receivedBytes: number;
      try {
        if (streaming) receivedBytes = await playSpeechResponse(response, audio, controller.signal, () => { downloadFinished = performance.now() - startedAt; });
        else {
          const blob = await response.blob();
          receivedBytes = blob.size;
          downloadFinished = performance.now() - startedAt;
          const url = URL.createObjectURL(blob);
          audio.src = url;
          try { await playAudioToEnd(audio); } finally { URL.revokeObjectURL(url); }
        }
        return { firstPlay, downloadFinished, bytes: receivedBytes, retainedSource: audio.getAttribute("src") };
      } finally { clearTimeout(safety); audio.pause(); }
    };
    return { previous: await run(false), streaming: await run(true), supportsMp3Stream: MediaSource.isTypeSupported("audio/mpeg") };
  }, fixture);
  expect(result.supportsMp3Stream).toBe(true);
  expect(result.streaming.firstPlay).toBeGreaterThan(0);
  expect(result.streaming.firstPlay).toBeLessThan(result.streaming.downloadFinished);
  expect(result.previous.firstPlay).toBeGreaterThanOrEqual(result.previous.downloadFinished);
  expect(result.streaming.bytes).toBe(result.previous.bytes);
  expect(result.streaming.retainedSource).toBeNull();
  await testInfo.attach("speech-start-timing", { body: JSON.stringify(result, null, 2), contentType: "application/json" });
  console.log("Controlled audio-start measurement:", JSON.stringify(result));
});

test("unsupported browsers retain complete-clip playback", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { playSpeechResponse } = await import("/src/utils/stream-speech.ts");
    const original = window.MediaSource;
    Object.defineProperty(window, "MediaSource", { configurable: true, value: undefined });
    const audio = Object.assign(new EventTarget(), {
      src: "", ended: false,
      play() { queueMicrotask(() => { this.ended = true; this.dispatchEvent(new Event("ended")); }); return Promise.resolve(); },
      pause() { this.dispatchEvent(new Event("pause")); },
    });
    let downloaded = false;
    try {
      const clip = await playSpeechResponse(new Response("test-audio"), audio as unknown as HTMLAudioElement, new AbortController().signal, () => { downloaded = true; });
      return { downloaded, size: clip };
    } finally { Object.defineProperty(window, "MediaSource", { configurable: true, value: original }); }
  });
  expect(result).toEqual({ downloaded: true, size: 10 });
});

test("stopping a pending audio stream cancels it without late playback", async ({ page }) => {
  await page.goto("/");
  const result = await page.evaluate(async () => {
    const { playSpeechResponse } = await import("/src/utils/stream-speech.ts");
    const audio = new Audio();
    audio.muted = true;
    let starts = 0;
    audio.addEventListener("playing", () => starts++);
    let cancelled = false;
    const response = new Response(new ReadableStream({ cancel() { cancelled = true; } }));
    const controller = new AbortController();
    const pending = playSpeechResponse(response, audio, controller.signal, () => {});
    setTimeout(() => controller.abort(new DOMException("Stopped", "AbortError")), 50);
    const error = await pending.then(() => "none", error => error.name);
    return { starts, cancelled, error };
  });
  expect(result).toEqual({ starts: 0, cancelled: true, error: "AbortError" });
});

test("a stream failing after speech starts is marked partial rather than replayed", async ({ page }) => {
  await page.goto("/");
  const fixture = (await readFile("tests/fixtures/speech-tone.mp3")).toString("base64");
  const result = await page.evaluate(async encoded => {
    const { playSpeechResponse, PartialSpeechError } = await import("/src/utils/stream-speech.ts");
    const sample = Uint8Array.from(atob(encoded), c => c.charCodeAt(0));
    const bytes = new Uint8Array(sample.length * 16);
    for (let i = 0; i < 16; i++) bytes.set(sample, i * sample.length);
    let source: ReadableStreamDefaultController;
    const response = new Response(new ReadableStream({ start(stream) { source = stream; stream.enqueue(bytes); } }));
    const audio = new Audio();
    audio.muted = true;
    audio.addEventListener("playing", () => source.error(new Error("Connection lost")), { once: true });
    const controller = new AbortController();
    const safety = setTimeout(() => controller.abort(), 8_000);
    try {
      await playSpeechResponse(response, audio, controller.signal, () => {});
      return { partial: false, error: "none" };
    } catch (error) { return { partial: error instanceof PartialSpeechError, error: String(error) }; }
    finally { clearTimeout(safety); }
  }, fixture);
  expect(result.partial, result.error).toBe(true);
});
