// api/compose-sentence.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method Not Allowed" });
      return;
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: "Missing GOOGLE_GENERATIVE_AI_API_KEY" });
      return;
    }

    const body = (req.body || {}) as { tokens?: string[]; text?: string };
    const tokens =
      (Array.isArray(body?.tokens) && body.tokens) ||
      (typeof body?.text === "string" ? body.text.split(/\s+/).filter(Boolean) : []);
    const raw = tokens.join(" ").trim();
    if (!raw) {
      res.status(200).json({ sentence: "", confidence: 0 });
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        responseMimeType: "application/json",
        temperature: 0.3,
      },
    });

    const systemRules = `
You are a sentence composer for PECS-style token sequences.
Given short token lists like ["want","red","toy"] or a raw string "want red toy",
produce a simple, grammatical English sentence that preserves intent.
Use first-person present by default when the subject is omitted ("I").
Prefer short, concrete forms. Add articles/determiners where natural.
Do not invent meaning beyond obvious composition.
Return STRICT JSON with keys:
- "sentence": string
- "confidence": number between 0 and 1 reflecting how likely the composed sentence matches the intended meaning.
Rules:
- If the tokens already form a good sentence, you may return it with high confidence.
- If meaning is ambiguous or you suspect a wrong inference, keep it minimal and lower confidence.
- Do NOT include any extra commentary—ONLY JSON.
Examples:
tokens: ["want","red","toy"] → {"sentence":"I want the red toy.","confidence":0.92}
tokens: ["go","park","tomorrow"] → {"sentence":"I want to go to the park tomorrow.","confidence":0.78}
tokens: ["blue","sleep"] → {"sentence":"I want the blue one to sleep.","confidence":0.45}
`.trim();

    const userPayload = { tokens, raw };

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text:
                systemRules +
                `\n\nTokens JSON:\n` +
                JSON.stringify(userPayload, null, 2),
            },
          ],
        },
      ],
    });

    const text = (await result.response.text())?.trim() || "";
    let parsed: { sentence?: string; confidence?: number } = {};
    try {
      parsed = JSON.parse(text);
    } catch {
      res.status(200).json({ sentence: raw, confidence: 0 });
      return;
    }

    const sentence =
      typeof parsed.sentence === "string" && parsed.sentence.trim()
        ? parsed.sentence.trim()
        : raw;

    const confidence =
      typeof parsed.confidence === "number" &&
      isFinite(parsed.confidence) &&
      parsed.confidence >= 0 &&
      parsed.confidence <= 1
        ? parsed.confidence
        : 0;

    const THRESHOLD = 0.66;
    const finalSentence = confidence >= THRESHOLD ? sentence : raw;

    res.status(200).json({ sentence: finalSentence, confidence });
  } catch (err) {
    console.error("compose-sentence error:", err);
    res.status(200).json({ sentence: "", confidence: 0 });
  }
}
