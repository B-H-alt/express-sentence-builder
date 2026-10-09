// src/utils/compose-sentence.ts
import { getAccessToken } from "@/lib/supabase";
import type { AppLanguage } from "@/store/cardStore";

const compositionCache = new Map<string, string>();
export type SentenceTense = "past" | "present" | "future";
export type CompositionIssue = "sign_in_required" | "email_not_confirmed" | "rate_limited" | "unavailable";
export type CompositionResult = { sentence: string; issue?: CompositionIssue };

// Compose a sentence from input tokens or text using the server-side Gemini model
export async function composeSentence(input: { tokens?: string[]; text?: string; tense?: SentenceTense; language?: AppLanguage }): Promise<CompositionResult> {
  const inputLabels = input.tokens?.length
    ? input.tokens
    : input.text?.trim().split(/\s+/).filter(Boolean) ?? [];
  const tokens = inputLabels.join(" ").trim();

  if (!tokens) return { sentence: "" };

  const tense = input.tense ?? "present";
  const language = input.language ?? "en";
  const cacheKey = `${language}:${tense}:${tokens.toLocaleLowerCase()}`;
  const cached = compositionCache.get(cacheKey);
  if (cached !== undefined) return { sentence: cached };

  let timeout: number | undefined;
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) return { sentence: "", issue: "sign_in_required" };

    const controller = new AbortController();
    timeout = window.setTimeout(() => controller.abort(), 12_000);
    const response = await fetch("/api/compose", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ tokens: inputLabels, tense, language }),
      signal: controller.signal,
    });
    const data = (await response.json().catch(() => ({}))) as { sentence?: string; error?: string };
    if (!response.ok) {
      const issue: CompositionIssue = response.status === 401
        ? "sign_in_required"
        : data.error?.toLowerCase().includes("confirm your email")
          ? "email_not_confirmed"
          : response.status === 429
            ? "rate_limited"
            : "unavailable";
      return { sentence: "", issue };
    }

    const output = data.sentence?.trim() || "";

    // Avoid echoing unchanged text
    const result = output.toLowerCase() === tokens.toLowerCase() ? "" : output;
    if (compositionCache.size >= 100) {
      const oldestKey = compositionCache.keys().next().value;
      if (oldestKey) compositionCache.delete(oldestKey);
    }
    compositionCache.set(cacheKey, result);
    return { sentence: result };
  } catch (error) {
    console.error("[composeSentence] Error:", error);
    return { sentence: "", issue: "unavailable" };
  } finally {
    if (timeout !== undefined) window.clearTimeout(timeout);
  }
}
