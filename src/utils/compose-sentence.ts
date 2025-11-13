// src/utils/compose-sentence.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

/**
 * Compose a better English sentence from PECS tokens or raw text.
 * Returns ONLY the improved sentence text. If no improvement, return "".
 *
 * This version is defensive: it logs request/response shapes and tries
 * several ways of extracting the text from the Gemini SDK result.
 */
function log(...args: any[]) {
  // Uniform timestamped logging helper
  console.debug(`[composeSentence ${new Date().toISOString()}]`, ...args);
}

function safeStringify(obj: any, maxLen = 2000) {
  try {
    const s = JSON.stringify(obj, (k, v) => {
      // avoid huge dumps (like binary data); trim arrays/strings
      if (typeof v === "string" && v.length > 200) return v.slice(0, 200) + "...";
      if (Array.isArray(v) && v.length > 20) return v.slice(0, 20).concat(["..."]);
      return v;
    }, 2);
    return s.length > maxLen ? s.slice(0, maxLen) + " ...(truncated)" : s;
  } catch (e) {
    return String(obj);
  }
}

async function extractTextFromGeminiResult(result: any): Promise<string> {
  // Defensive extraction - try several likely locations
  log("Attempting to extract text from Gemini result. Raw shape:", safeStringify(result, 5000));

  try {
    // 1) .response.text() - function returning text (preferred)
    if (result?.response?.text) {
      try {
        const maybeFn = result.response.text;
        if (typeof maybeFn === "function") {
          log("Found response.text() function. Invoking...");
          const txt = await maybeFn();
          if (typeof txt === "string" && txt.trim()) {
            log("Extracted from response.text():", txt.slice(0, 400));
            return txt;
          }
          log("response.text() returned empty or non-string:", typeof txt, txt);
        } else if (typeof maybeFn === "string" && maybeFn.trim()) {
          log("response.text is a string field:", maybeFn.slice(0, 400));
          return maybeFn;
        }
      } catch (err) {
        log("Error calling response.text():", err);
      }
    }

    // 2) result.output or result.output[0].content items (common alternative)
    const maybeOutput = result?.output ?? result?.response?.output ?? result?.response?.items;
    if (maybeOutput) {
      try {
        // Normalize to array
        const arr = Array.isArray(maybeOutput) ? maybeOutput : [maybeOutput];
        for (const item of arr) {
          // content may be an array of parts with text fields
          if (Array.isArray(item?.content)) {
            const joined = item.content.map((c: any) => c?.text ?? c?.value ?? "").join(" ").trim();
            if (joined) {
              log("Extracted from output.content[]:", joined.slice(0, 400));
              return joined;
            }
          }
          // item.text
          if (typeof item?.text === "string" && item.text.trim()) {
            log("Extracted from output item.text:", item.text.slice(0, 400));
            return item.text;
          }
          // item.content may be object
          if (typeof item?.content === "object") {
            const txts: string[] = [];
            for (const k of Object.keys(item.content)) {
              const v = item.content[k];
              if (typeof v === "string") txts.push(v);
              else if (v && typeof v.text === "string") txts.push(v.text);
            }
            const joined = txts.join(" ").trim();
            if (joined) {
              log("Extracted from output.content (object):", joined.slice(0, 400));
              return joined;
            }
          }
        }
      } catch (err) {
        log("Error reading output/content shape:", err);
      }
    }

    // 3) result.candidates[0].content[0].text (some variants)
    if (Array.isArray(result?.candidates) && result.candidates.length > 0) {
      try {
        const c0 = result.candidates[0];
        if (Array.isArray(c0?.content)) {
          const joined = c0.content.map((p: any) => p?.text ?? "").join(" ").trim();
          if (joined) {
            log("Extracted from candidates[0].content:", joined.slice(0, 400));
            return joined;
          }
        }
        if (typeof c0?.text === "string" && c0.text.trim()) {
          log("Extracted from candidates[0].text:", c0.text.slice(0, 400));
          return c0.text;
        }
      } catch (err) {
        log("Error reading candidates shape:", err);
      }
    }

    // 4) result.outputText (some SDKs provide this convenience)
    if (typeof result?.outputText === "string" && result.outputText.trim()) {
      log("Extracted from outputText:", result.outputText.slice(0, 400));
      return result.outputText;
    }

    // 5) Fallback: walk the object and find the largest string value (last resort)
    let largest = "";
    (function walk(o: any, depth = 0) {
      if (!o || depth > 6) return;
      if (typeof o === "string") {
        if (o.length > largest.length) largest = o;
        return;
      }
      if (Array.isArray(o)) {
        for (const it of o) walk(it, depth + 1);
        return;
      }
      if (typeof o === "object") {
        for (const k of Object.keys(o)) walk(o[k], depth + 1);
      }
    })(result);

    if (largest) {
      log("Fallback extracted largest-string:", largest.slice(0, 400));
      return largest;
    }

    // Nothing found
    log("No text-like field was found in the Gemini result.");
    return "";
  } catch (err) {
    log("Unexpected error while extracting text:", err);
    return "";
  }
}

export async function composeSentence(input: { tokens?: string[]; text?: string }): Promise<string> {
  const tokens =
    (Array.isArray(input.tokens) && input.tokens.length ? input.tokens : undefined) ??
    (typeof input.text === "string" ? input.text.split(/\s+/).filter(Boolean) : []);
  const raw = tokens.join(" ").trim();
  if (!raw) {
    log("No raw text or tokens; returning empty.");
    return "";
  }

  const apiKey = import.meta.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY;
  if (!apiKey) {
    log("No API key configured (VITE_GOOGLE_GENERATIVE_AI_API_KEY). Returning empty to let caller speak raw.");
    return "";
  }

  try {
    log("Initializing GoogleGenerativeAI with model gemini-1.5-flash");
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

    const userPrompt = `Tokens:\n${JSON.stringify(tokens)}\nRaw:\n${raw}`;

    log("Sending generateContent request. Prompt snapshot:", { instruction: instruction.slice(0, 300), userPrompt: userPrompt.slice(0, 300) });

    const result = await model.generateContent({
      contents: [
        { role: "system", parts: [{ text: "You are a helpful sentence composer." }] },
        { role: "user", parts: [{ text: instruction }] },
        { role: "user", parts: [{ text: userPrompt }] },
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "text/plain",
        // optional safety: limit output size
        maxOutputTokens: 120,
      },
    });

    log("Received generateContent result (raw):", safeStringify(result, 8000));

    const out = (await extractTextFromGeminiResult(result)).trim();

    log("Normalized extracted output (first 400 chars):", out.slice(0, 400));

    // If Gemini parrots the input or gives nothing, signal "no improvement"
    const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
    if (!out) {
      log("No output extracted from Gemini. Returning empty.");
      return "";
    }
    if (normalize(out) === normalize(raw)) {
      log("Gemini output equals normalized raw input -> no improvement. Returning empty.");
      return "";
    }

    log("Returning improved sentence:", out);
    return out;
  } catch (err) {
    console.error(`[composeSentence ${new Date().toISOString()}] composeSentence error:`, err);
    return ""; // empty => caller will speak the raw input
  }
}
