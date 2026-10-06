interface ApiRequest {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: (body?: Buffer) => void;
}

const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const requestsByUser = new Map<string, { count: number; resetAt: number }>();

const getHeader = (req: ApiRequest, name: string) => {
  const value = req.headers[name];
  return Array.isArray(value) ? value[0] : value;
};

const authenticateParent = async (req: ApiRequest) => {
  const supabaseUrl = process.env.SUPABASE_URL?.trim();
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY?.trim();
  const authorization = getHeader(req, "authorization")?.trim();
  if (!supabaseUrl || !publishableKey || !authorization?.startsWith("Bearer ")) return null;

  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: { apikey: publishableKey, Authorization: authorization },
    signal: AbortSignal.timeout(4_000),
  });
  if (!response.ok) return null;
  const user = (await response.json()) as { id?: unknown };
  return typeof user.id === "string" && user.id ? user.id : null;
};

const isRateLimited = (userId: string) => {
  const now = Date.now();
  const current = requestsByUser.get(userId);
  if (!current || current.resetAt <= now) {
    requestsByUser.set(userId, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  res.setHeader("Cache-Control", "no-store");
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }

  let userId: string | null = null;
  try {
    userId = await authenticateParent(req);
  } catch {
    res.status(503).json({ error: "Account verification is unavailable." });
    return;
  }
  if (!userId) {
    res.status(401).json({ error: "Sign in is required." });
    return;
  }
  if (isRateLimited(userId)) {
    res.status(429).json({ error: "Too many requests. Please wait a moment." });
    return;
  }

  const text = typeof (req.body as { text?: unknown } | null)?.text === "string"
    ? (req.body as { text: string }).text.trim()
    : "";
  if (!text || text.length > 240) {
    res.status(400).json({ error: "Invalid sentence." });
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY || process.env.VITE_ELEVENLABS_API_KEY;
  const voiceId = process.env.ELEVENLABS_VOICE_ID || process.env.VITE_ELEVENLABS_VOICE_ID || "21m00Tcm4TlvDq8ikWAM";
  if (!apiKey) {
    res.status(503).json({ error: "Voice service is unavailable." });
    return;
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_turbo_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      res.status(502).json({ error: "Voice service failed." });
      return;
    }

    const audio = Buffer.from(await response.arrayBuffer());
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", String(audio.length));
    res.status(200).end(audio);
  } catch {
    res.status(502).json({ error: "Voice service failed." });
  }
}
