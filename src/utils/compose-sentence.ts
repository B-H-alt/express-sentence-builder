// src/utils/compose-sentence.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Compose a better English sentence from PECS tokens or raw text.
 * Returns ONLY the improved sentence text. If no improvement, return "".
 */
export async function composeSentence(input: { tokens?: string[]; text?: string }): Promise<string> {
  const tokens =
    (Array.isArray(input.tokens) && input.tokens.length ? input.tokens : undefined) ??
    (typeof input.text === "string" ? input.text.split(/\s+/).filter(Boolean) : []);
  const raw = tokens.join(" ").trim();
  if (!raw) return "";

  const apiKey = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return ""; // empty => caller will speak the raw input

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const instruction = `
You are a sentence composer for PECS-style token sequences.
Given tokens like ["want","red","toy"] or raw "want red toy",
produce a simple grammatical English sentence preserving intent.
Default to first-person present ("I") when the subject is omitted.
Prefer short, concrete forms.
Guidelines:
- Use simple grammar, add articles only when natural.
- Prefer first-person present ("I") when subject is omitted.
- Be polite and formal.
- Keep it short and concrete.
Examples:
- "want red toy" becomes "I want the red toy."
- "teacher stop listen to music" becomes "Teacher, stop listening to music please."
- "dog eat food" becomes "The dog is eating food."
`.trim();

    const result = await model.generateContent({
      contents: [
        { role: "user", parts: [{ text: instruction }] },
        { role: "user", parts: [{ text: `Tokens:\n${JSON.stringify(tokens)}\nRaw:\n${raw}` }] },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "text/plain",
      },
    });

    // ✅ Correct way to extract text (Gemini SDK v1.1+)
    const out = result.response.text().trim();

    // If Gemini parrots the input or gives nothing, signal "no improvement"
    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
    if (!out || normalize(out) === normalize(raw)) return "";

    return out;
  } catch (err) {
    console.error("composeSentence error:", err);
    return ""; // empty => caller will speak the raw input
  }
}
