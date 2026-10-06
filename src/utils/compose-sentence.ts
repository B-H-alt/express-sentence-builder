// src/utils/compose-sentence.ts
import { getAccessToken } from "@/lib/supabase";

const compositionCache = new Map<string, string>();

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
