// src/utils/composeSentence.ts
import { GoogleGenAI } from "@google/genai";

export type ComposeSentenceResult = {
  sentence: string;
  confidence: number;
};

export async function composeSentence(input: { tokens?: string[]; text?: string }): Promise<ComposeSentenceResult> {
  const apiKey = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) return { sentence: "", confidence: 0 };

  const tokens = (Array.isArray(input.tokens) && input.tokens) ||
                 (typeof input.text === "string" ? input.text.split(/\s+/).filter(Boolean) : []);
  const raw = tokens.join(" ").trim();
  if (!raw) return { sentence: "", confidence: 0 };

  const ai = new GoogleGenAI({ apiKey });
  const systemRules = `
You are a sentence composer for PECS-style token sequences.
Given short token lists like ["want","red","toy"] or a raw string "want red toy",
produce a simple, grammatical English sentence that preserves intent.
Use first‑person present by default when the subject is omitted ("I").
Prefer short, concrete forms. Add articles/determiners where natural.
Do not invent meaning beyond obvious composition.
Return STRICT JSON with keys:
- "sentence": string
- "confidence": number between 0 and 1
`.trim();

  const userPayload = { tokens, raw };

  try {
    const response = await ai.models.generateContent({
      model: "gemini‑1.5‑flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: systemRules + "\n\nTokens JSON:\n" + JSON.stringify(userPayload, null, 2),
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const text = (response.text?.trim()) || raw;

    let parsed: { sentence?: string; confidence?: number } = {};
    try {
      const match = text.match(/\{[\s\S]*\}/);
      parsed = match ? JSON.parse(match[0]) : { sentence: raw, confidence: 0 };
    } catch {
      parsed = { sentence: raw, confidence: 0 };
    }

    const sentence = parsed.sentence?.trim() || raw;
    const confidence = (typeof parsed.confidence === "number" &&
                        parsed.confidence >= 0 &&
                        parsed.confidence <= 1)
                       ? parsed.confidence
                       : 0;
    const THRESHOLD = 0.66;
    return { sentence: confidence >= THRESHOLD ? sentence : raw, confidence };
  } catch (err) {
    console.error("composeSentence error:", err);
    return { sentence: "", confidence: 0 };
  }
}
