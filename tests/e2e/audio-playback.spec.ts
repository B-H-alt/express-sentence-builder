import { expect, test } from "@playwright/test";
import { playAudioToEnd } from "../../src/utils/play-audio";

test("enhanced voice waits until audio ends, not just until it starts", async () => {
  const audio = Object.assign(new EventTarget(), { play: async () => {}, ended: false });
  let finished = false;
  const playback = playAudioToEnd(audio as unknown as HTMLAudioElement).then(() => { finished = true; });
  await Promise.resolve();
  await Promise.resolve();
  expect(finished).toBe(false);
  audio.ended = true;
  audio.dispatchEvent(new Event("ended"));
  await playback;
  expect(finished).toBe(true);
});

test("audio failure and deliberate stop settle playback instead of hanging", async () => {
  for (const event of ["error", "pause"]) {
    const audio = Object.assign(new EventTarget(), { play: async () => {}, ended: false });
    const result = playAudioToEnd(audio as unknown as HTMLAudioElement).catch((error: Error) => error.name);
    audio.dispatchEvent(new Event(event));
    expect(await result).toBe(event === "pause" ? "AbortError" : "Error");
  }
});
