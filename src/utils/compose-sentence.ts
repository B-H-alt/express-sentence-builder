import { onPrivateSessionChange, privateSessionRevision } from "@/lib/privateSession";
// src/utils/compose-sentence.ts
import { getAccessToken } from "@/lib/supabase";
import { getApiUrl } from "@/lib/runtimeUrls";
import type { AppLanguage } from "@/store/cardStore";
import { correctOfflineGrammar } from "./offline-grammar";

export type SentenceTense = "past" | "present" | "future";
export type CompositionIssue = "sign_in_required" | "email_not_confirmed" | "rate_limited" | "unavailable" | "offline";
export type CompositionResult = { sentence: string; issue?: CompositionIssue; source?: "offline_rules" };

// Compose a sentence from input tokens or text using the server-side Gemini model
export async function composeSentence(input: { tokens?: string[]; text?: string; tense?: SentenceTense; language?: AppLanguage }): Promise<CompositionResult> {
  const inputLabels = input.tokens?.length
    ? input.tokens
    : input.text?.trim().split(/\s+/).filter(Boolean) ?? [];
  const tokens = inputLabels.join(" ").trim();

  if (!tokens) return { sentence: "" };

  const tense = input.tense ?? "present";
  const language = input.language ?? "en";
  const sessionRevision = privateSessionRevision();
  if (!navigator.onLine) {
    const sentence = correctOfflineGrammar(inputLabels, tense, language);
    return { sentence, issue: "offline", ...(sentence ? { source: "offline_rules" as const } : {}) };
  }

  let timeout: number | undefined;
  let unsubscribe: (() => void) | undefined;
  try {
    const accessToken = await getAccessToken();
    if (sessionRevision !== privateSessionRevision()) throw new DOMException("Account changed.", "AbortError");
    if (!accessToken) return { sentence: "", issue: "sign_in_required" };

    const controller = new AbortController();
    unsubscribe = onPrivateSessionChange(() => controller.abort());
    timeout = window.setTimeout(() => controller.abort(), 12_000);
    const response = await fetch(getApiUrl("/api/compose"), {
      method: "POST",
      cache: "no-store",
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
    if (sessionRevision !== privateSessionRevision()) throw new DOMException("Account changed.", "AbortError");
    return { sentence: result };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    console.error("Grammar request failed");
    return { sentence: "", issue: "unavailable" };
  } finally {
    unsubscribe?.();
    if (timeout !== undefined) window.clearTimeout(timeout);
  }
}
