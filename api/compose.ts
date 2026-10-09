import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { authorizeFeature, rejectUnlessPost, setPrivateApiHeaders } from "./_security.js";

interface ApiRequest {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
}

interface ComposeBody {
  tokens?: unknown;
  tense?: unknown;
  language?: unknown;
}

export const config = {
  api: { bodyParser: { sizeLimit: "16kb" } },
};

const parseTokens = (body: unknown) => {
  const candidate = (body ?? {}) as ComposeBody;
  if (!Array.isArray(candidate.tokens)) return null;
  if (candidate.tokens.length < 1 || candidate.tokens.length > 20) return null;

  const tokens = candidate.tokens
    .filter((token): token is string => typeof token === "string")
    .map((token) => token.trim())
    .filter(Boolean);

  if (tokens.length !== candidate.tokens.length) return null;
  if (tokens.some((token) => token.length > 60)) return null;
  return tokens;
};

const parseTense = (body: unknown) => {
  const tense = (body ?? {}) as ComposeBody;
  return tense.tense === "past" || tense.tense === "future" ? tense.tense : "present";
};

const parseLanguage = (body: unknown) => {
  const candidate = (body ?? {}) as ComposeBody;
  return candidate.language === "es" ? "es" : "en";
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setPrivateApiHeaders(res);
  if (rejectUnlessPost(req, res)) return;

  const tokens = parseTokens(req.body);
  if (!tokens) {
    res.status(400).json({ ok: false, error: "Invalid card labels." });
    return;
  }
  const tense = parseTense(req.body);
  const language = parseLanguage(req.body);

  const access = await authorizeFeature(req, "grammar", 1);
  if (!access.ok) {
    res.status(access.status).json({ ok: false, error: access.error });
    return;
  }

  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    res.status(503).json({ ok: false, error: "Grammar service is unavailable." });
    return;
  }

  const prompt = language === "es"
    ? `Convierte estas tarjetas AAC ordenadas en una sola frase corta y natural en tiempo ${tense === "past" ? "pasado" : tense === "future" ? "futuro" : "presente"}. Una persona seguida de una acción describe lo que hace esa persona. Usa "yo" para los deseos, necesidades, acciones y sentimientos del usuario. Solo crea una pregunta cuando una tarjeta sea una pregunta. Conserva las negaciones. Añade únicamente las palabras gramaticales necesarias y no inventes detalles. Español cotidiano; devuelve solo la frase.\nTarjetas: ${JSON.stringify(tokens)}`
    : `Turn these ordered AAC cards into one short, natural ${tense}-tense sentence. A person followed by an action describes what that person is doing. Use "I" for the learner's wants, needs, actions, and feelings. Only make a question when a card is a question. Preserve negatives. Add only needed grammar words and never invent details. Everyday English; sentence only.\nExamples: ["Dad","Go outside"] in present = Dad is going outside. ["I","Want","Water"] in past = I wanted water. ["Where?","Mom"] in future = Where will Mom be?\nCards: ${JSON.stringify(tokens)}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
        temperature: 0.1,
        maxOutputTokens: 64,
      },
    });

    const sentence = response.text?.replace(/\s+/g, " ").trim().slice(0, 240) || "";
    if (!sentence) {
      res.status(502).json({ ok: false, error: "No sentence was returned." });
      return;
    }

    res.status(200).json({ ok: true, sentence });
  } catch (error) {
    console.error("Grammar composition failed", {
      message: error instanceof Error ? error.message : "Unknown error",
    });
    res.status(502).json({ ok: false, error: "Grammar service failed." });
  }
}
