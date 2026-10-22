import { playAudioToEnd } from "./play-audio";

const MAX_AUDIO_BYTES = 5 * 1024 * 1024;

// A partial spoken message must not be automatically repeated by a fallback voice.
export class PartialSpeechError extends Error {}

const waitFor = (target: EventTarget, event: string, signal: AbortSignal, start?: () => void) => new Promise<void>((resolve, reject) => {
  const cleanup = () => {
    target.removeEventListener(event, ready);
    target.removeEventListener("error", failed);
    signal.removeEventListener("abort", aborted);
  };
  const ready = () => { cleanup(); resolve(); };
  const failed = () => { cleanup(); reject(new Error("Audio stream could not play.")); };
  const aborted = () => { cleanup(); reject(signal.reason); };
  if (signal.aborted) { reject(signal.reason); return; }
  target.addEventListener(event, ready, { once: true });
  target.addEventListener("error", failed, { once: true });
  signal.addEventListener("abort", aborted, { once: true });
  try { start?.(); } catch (error) { cleanup(); reject(error); }
});

/** Play the first decodable MP3 frames immediately, retaining the completed clip for replay. */
export const playSpeechResponse = async (
  response: Response,
  audio: HTMLAudioElement,
  signal: AbortSignal,
  onDownloaded: () => void,
): Promise<Blob> => {
  const canStream = typeof MediaSource !== "undefined" && MediaSource.isTypeSupported("audio/mpeg") &&
    typeof audio.load === "function" && Boolean(response.body);
  let url: string | undefined;
  let started = false;
  const work = new AbortController();
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  const onPlaying = () => { started = true; };
  const onAbort = () => {
    work.abort(signal.reason);
    void reader?.cancel().catch(() => {});
    audio.pause();
  };
  audio.addEventListener("playing", onPlaying, { capture: true });
  signal.addEventListener("abort", onAbort, { once: true });
  try {
    signal.throwIfAborted();
    if (!canStream) {
      const blob = await response.blob();
      onDownloaded();
      signal.throwIfAborted();
      if (blob.size > MAX_AUDIO_BYTES) throw new Error("Audio response was too large.");
      url = URL.createObjectURL(blob);
      audio.src = url;
      await playAudioToEnd(audio);
      return blob;
    }

    const media = new MediaSource();
    const opened = waitFor(media, "sourceopen", work.signal, () => {
      url = URL.createObjectURL(media);
      audio.src = url;
      audio.load();
    });
    await opened;
    const buffer = media.addSourceBuffer("audio/mpeg");
    reader = response.body!.getReader();
    const chunks: Uint8Array<ArrayBuffer>[] = [];
    let bytes = 0;
    // Attach rejection handlers immediately: playback can fail while the next chunk is pending.
    const playback = playAudioToEnd(audio);
    const pump = async () => {
      try {
        while (true) {
          work.signal.throwIfAborted();
          const { value, done } = await reader.read();
          if (done) break;
          bytes += value.byteLength;
          if (bytes > MAX_AUDIO_BYTES) throw new Error("Audio response was too large.");
          const chunk = new Uint8Array(value);
          chunks.push(chunk);
          await waitFor(buffer, "updateend", work.signal, () => buffer.appendBuffer(chunk));
        }
        work.signal.throwIfAborted();
        if (!bytes) throw new Error("Voice service returned no audio.");
        media.endOfStream();
        onDownloaded();
      } finally {
        await reader.cancel().catch(() => {});
        reader.releaseLock();
      }
    };
    await Promise.all([playback, pump()]);
    return new Blob(chunks, { type: "audio/mpeg" });
  } catch (error) {
    work.abort(error);
    if (reader) void reader.cancel().catch(() => {});
    else void response.body?.cancel().catch(() => {});
    audio.pause();
    if (signal.aborted) throw signal.reason;
    if (started) throw new PartialSpeechError("Speech was interrupted. Your sentence is still here; press Speak to try again.");
    throw error;
  } finally {
    signal.removeEventListener("abort", onAbort);
    audio.removeEventListener("playing", onPlaying, { capture: true });
    if (url) URL.revokeObjectURL(url);
  }
};
