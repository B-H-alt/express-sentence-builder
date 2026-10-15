// play() resolves when playback starts, not when the message finishes.
export const playAudioToEnd = (audio: HTMLAudioElement): Promise<void> => new Promise((resolve, reject) => {
  const cleanup = () => {
    audio.removeEventListener("ended", ended);
    audio.removeEventListener("error", failed);
    audio.removeEventListener("pause", paused);
  };
  const ended = () => { cleanup(); resolve(); };
  const failed = () => { cleanup(); reject(new Error("Audio playback failed.")); };
  const paused = () => {
    if (audio.ended) return;
    cleanup();
    reject(new DOMException("Playback stopped.", "AbortError"));
  };
  audio.addEventListener("ended", ended);
  audio.addEventListener("error", failed);
  audio.addEventListener("pause", paused);
  audio.play().catch((error) => { cleanup(); reject(error); });
});
