/** One retained device utterance, shared by sentence speech, quick phrases and voice testing. */
let active: { utterance: SpeechSynthesisUtterance; cancel: () => void } | null = null;

export const stopDeviceSpeech = () => {
  active?.cancel();
  window.speechSynthesis?.cancel();
};

export const speakDeviceText = (text: string, language: "en" | "es", rate: number, volume: number): Promise<void> => {
  stopDeviceSpeech();
  return new Promise((resolve, reject) => {
    if (!window.speechSynthesis || !window.SpeechSynthesisUtterance) {
      reject(new Error("Device voice is unavailable in this browser.")); return;
    }
    if (volume <= 0) { reject(new Error("Expressly volume is muted. Raise it in Cards & voice.")); return; }
    const engine = window.speechSynthesis;
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = engine.getVoices();
    const local = voices.find(voice => voice.localService && voice.lang.toLowerCase().startsWith(language));
    if (!navigator.onLine && voices.length && !local) {
      reject(new Error("Download a device voice for this language to speak offline.")); return;
    }
    utterance.lang = language === "es" ? "es-US" : "en-US";
    if (local) utterance.voice = local;
    utterance.rate = rate;
    utterance.volume = volume;
    let settled = false;
    let timer: ReturnType<typeof setTimeout>;
    const finish = (error?: Error) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      utterance.onstart = utterance.onend = utterance.onerror = null;
      if (active?.utterance === utterance) active = null;
      if (error) reject(error); else resolve();
    };
    const timedOut = () => {
      finish(new Error("Device voice did not respond. Try again, or check your device's sound output."));
      engine.cancel();
    };
    active = { utterance, cancel: () => finish(new DOMException("Playback stopped.", "AbortError")) };
    // Some engines never deliver an error. Always restore the Speak control.
    timer = setTimeout(timedOut, 8_000);
    utterance.onstart = () => {
      clearTimeout(timer);
      const words = text.trim().split(/\s+/).length;
      timer = setTimeout(timedOut, Math.max(30_000, words * 900 / Math.max(rate, 0.5) + 20_000));
    };
    utterance.onend = () => finish();
    utterance.onerror = () => finish(new Error("Device voice could not play. Check your device's sound output and try again."));
    try {
      if (engine.paused) engine.resume();
      engine.speak(utterance);
    } catch (error) { finish(error instanceof Error ? error : new Error("Device voice could not play.")); }
  });
};
