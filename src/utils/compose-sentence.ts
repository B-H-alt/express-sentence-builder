// src/utils/compose-sentence.ts
import { getAccessToken } from "@/lib/supabase";

const compositionCache = new Map<string, string>();

const finishSentence = (text: string, isQuestion = false) => {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const capitalized = cleaned.charAt(0).toLocaleUpperCase() + cleaned.slice(1);
  if (/[.!?]$/.test(capitalized)) return capitalized;
  return `${capitalized}${isQuestion ? "?" : "."}`;
};

const composeCommonPattern = (labels: string[]) => {
  const cleanLabels = labels.map((label) => label.trim()).filter(Boolean);
  if (cleanLabels.length === 0) return "";

  const first = cleanLabels[0];
  const firstLower = first.toLocaleLowerCase();
  const remaining = cleanLabels.slice(1).join(" ").toLocaleLowerCase();

  if (cleanLabels.length === 1 && /[.!?]$/.test(first)) return finishSentence(first);

  if (first.endsWith("?") && remaining) {
    return finishSentence(`${first.slice(0, -1)} ${remaining}`, true);
  }

  const selfSubjects = new Set(["me", "i"]);
  const linkingWords = new Set([
    "happy", "sad", "mad", "tired", "scared", "excited", "calm", "silly",
    "bored", "frustrated", "proud", "nervous", "surprised", "hot", "cold",
  ]);
  const clearSelfActions = new Set([
    "want", "need", "like", "don't like", "dont like", "don't want", "dont want",
    "feel", "go", "eat", "drink", "play", "read", "help",
  ]);

  if (selfSubjects.has(firstLower) && cleanLabels.length > 1) {
    const secondLower = cleanLabels[1].toLocaleLowerCase();
    const rest = cleanLabels.slice(1).join(" ").toLocaleLowerCase();
    return finishSentence(linkingWords.has(secondLower) ? `I am ${rest}` : `I ${rest}`);
  }

  if (clearSelfActions.has(firstLower)) {
    return finishSentence(`I ${[first, ...cleanLabels.slice(1)].join(" ").toLocaleLowerCase()}`);
  }

  return "";
};

// Compose a sentence from input tokens or text using Gemini 2.5 Flash
export async function composeSentence(input: { tokens?: string[]; text?: string }): Promise<string> {
  const inputLabels = input.tokens?.length
    ? input.tokens
    : input.text?.trim().split(/\s+/).filter(Boolean) ?? [];
  const tokens = inputLabels.join(" ").trim();

  if (!tokens) return "";

  const cacheKey = tokens.toLocaleLowerCase();
  const cached = compositionCache.get(cacheKey);
  if (cached !== undefined) return cached;

  const commonResult = composeCommonPattern(inputLabels);
  if (commonResult) {
    compositionCache.set(cacheKey, commonResult);
    return commonResult;
  }

  let timeout: number | undefined;
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return "";

    const controller = new AbortController();
    timeout = window.setTimeout(() => controller.abort(), 5_000);
    const response = await fetch("/api/compose", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ tokens: inputLabels }),
      signal: controller.signal,
    });
    if (!response.ok) return "";
    const data = (await response.json()) as { sentence?: string };

    const output = data.sentence?.trim() || "";

    // Avoid echoing unchanged text
    const result = output.toLowerCase() === tokens.toLowerCase() ? "" : output;
    if (compositionCache.size >= 100) {
      const oldestKey = compositionCache.keys().next().value;
      if (oldestKey) compositionCache.delete(oldestKey);
    }
    compositionCache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("[composeSentence] Error:", error);
    return "";
  } finally {
    if (timeout !== undefined) window.clearTimeout(timeout);
  }
}
