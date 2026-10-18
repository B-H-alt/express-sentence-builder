// play() resolves when playback starts, not when the message finishes.
export const playAudioToEnd = (audio: HTMLAudioElement): Promise<void> => new Promise((resolve, reject) => {
  let timer: ReturnType<typeof setTimeout>;
  const cleanup = () => {
    clearTimeout(timer);
    audio.removeEventListener("ended", ended);
    audio.removeEventListener("error", failed);
    audio.removeEventListener("pause", paused);
    audio.removeEventListener("playing", started);
  };
  const ended = () => { cleanup(); resolve(); };
  const failed = () => { cleanup(); reject(new Error("Audio playback failed.")); };
  const timedOut = () => { cleanup(); audio.pause(); reject(new Error("Audio did not respond. Try again.")); };
  const started = () => {
    clearTimeout(timer);
    const duration = Number.isFinite(audio.duration) ? audio.duration / Math.max(audio.playbackRate, 0.5) * 1000 + 15_000 : 180_000;
    timer = setTimeout(timedOut, Math.max(30_000, duration));
  };
  const paused = () => {
    if (audio.ended) return;
    cleanup();
    reject(new DOMException("Playback stopped.", "AbortError"));
  };
  audio.addEventListener("ended", ended);
  audio.addEventListener("error", failed);
  audio.addEventListener("pause", paused);
  audio.addEventListener("playing", started);
  timer = setTimeout(timedOut, 8_000);
  audio.play().catch((error) => { cleanup(); reject(error); });
});
