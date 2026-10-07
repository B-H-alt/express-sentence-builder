import { GoogleGenAI } from "@google/genai";

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
}

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const requestsByUser = new Map<string, { count: number; resetAt: number }>();

const getHeader = (req: ApiRequest, name: string) => {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
};

const isRateLimited = (userId: string) => {
  const now = Date.now();
  if (requestsByUser.size > 1_000) {
    for (const [key, value] of requestsByUser) {
      if (value.resetAt <= now) requestsByUser.delete(key);
    }
  }
  const current = requestsByUser.get(userId);
  if (!current || current.resetAt <= now) {
    requestsByUser.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }

  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
};

const authenticateParent = async (req: ApiRequest) => {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  const authorization = getHeader(req, "authorization")?.trim();

  if (!supabaseUrl || !publishableKey || !authorization?.startsWith("Bearer ")) {
    return null;
  }

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: publishableKey,
      Authorization: authorization,
    },
    signal: AbortSignal.timeout(4_000),
  });

  if (!response.ok) return null;
  const user = (await response.json()) as { id?: unknown };
  return typeof user.id === "string" && user.id ? user.id : null;
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

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");

  if (req.method !== "POST") {
    res.status(405).json({ ok: false, error: "Method not allowed." });
    return;
  }

  let userId: string | null = null;
  try {
    userId = await authenticateParent(req);
  } catch {
    res.status(503).json({ ok: false, error: "Account verification is unavailable." });
    return;
  }

  if (!userId) {
    res.status(401).json({ ok: false, error: "Sign in is required." });
    return;
  }

  if (isRateLimited(userId)) {
    res.status(429).json({ ok: false, error: "Too many requests. Please wait a moment." });
    return;
  }

  const tokens = parseTokens(req.body);
  if (!tokens) {
    res.status(400).json({ ok: false, error: "Invalid card labels." });
    return;
  }

  // Temporary fallback keeps the existing Vercel setting working while the
  // secret is renamed. The browser no longer reads either value.
  const apiKey =
    process.env.GOOGLE_GENERATIVE_AI_API_KEY ||
    process.env.VITE_GOOGLE_GENERATIVE_AI_API_KEY;

  if (!apiKey) {
    res.status(503).json({ ok: false, error: "Grammar service is unavailable." });
    return;
  }

  const prompt = `Turn these ordered AAC cards into one short, natural sentence. A person followed by an action describes what that person is doing. Use "I" for the learner's wants, needs, actions, and feelings. Only make a question when a card is a question. Preserve negatives. Add only needed grammar words and never invent details. Everyday English; sentence only.\nExamples: ["Dad","Go outside"] = Dad is going outside. ["I","Want","Water"] = I want water. ["Where?","Mom"] = Where is Mom?\nCards: ${JSON.stringify(tokens)}`;

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash-lite",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: "MINIMAL" },
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
