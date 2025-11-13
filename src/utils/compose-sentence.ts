// src/utils/compose-sentence.ts
import { GoogleGenAI } from "@google/genai";

const apiKey = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY;

// Compose a sentence from input tokens or text using Gemini 2.5 Flash
export async function composeSentence(input: { tokens?: string[]; text?: string }): Promise<string> {
  if (!apiKey) {
    console.error("Missing Gemini API key. Set VITE_GOOGLE_GENERATIVE_AI_API_KEY in .env");
    return "";
  }

  const ai = new GoogleGenAI({ apiKey });
  const model = "gemini-2.5-flash";

  const tokens =
    (input.tokens && input.tokens.length > 0
      ? input.tokens.join(" ")
      : input.text?.trim()) || "";

  if (!tokens) return "";

  const prompt = `
You are a sentence composer for PECS-style token sequences.
Convert this input into a simple, grammatically correct English sentence.
Prefer short, clear forms in first-person if needed. If the first word in the input is a noun, always assume it is the subject of the sentence.
Always just give me the output sentence, never anything more. If there are multiple possible options, just always default to the first one. 
Input: ${tokens}
  `.trim();

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        thinkingConfig: {
          thinkingBudget: 0, // Disables thinking
        },
      }
    });

    // The SDK automatically returns the text output
    const output = response.text?.trim() || "";
    console.log("[composeSentence]", { input: tokens, output });

    // Avoid echoing unchanged text
    if (output.toLowerCase() === tokens.toLowerCase()) return "";
    return output;
  } catch (error) {
    console.error("[composeSentence] Error:", error);
    return "";
  }
}
