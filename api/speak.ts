import { authorizeFeature, handleNativeCors, rejectUnlessPost, setPrivateApiHeaders } from "./_security.js";

interface ApiRequest {
  method?: string;
  body?: unknown;
  headers: Record<string, string | string[] | undefined>;
}

interface ApiResponse {
  status: (code: number) => ApiResponse;
  json: (body: unknown) => void;
  setHeader: (name: string, value: string) => void;
  end: (body?: unknown) => void;
}

export const config = {
  api: { bodyParser: { sizeLimit: "8kb" } },
};

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setPrivateApiHeaders(res);
  if (handleNativeCors(req, res)) return;
  if (rejectUnlessPost(req, res)) return;

  const text = typeof (req.body as { text?: unknown } | null)?.text === "string"
    ? (req.body as { text: string }).text.trim()
    : "";
  if (!text || text.length > 240) {
    res.status(400).json({ error: "Invalid sentence." });
    return;
  }

  const access = await authorizeFeature(req, "voice", text.length);
  if (!access.ok) {
    if (access.status === 429 && access.retryAfter) {
      res.setHeader("Retry-After", String(access.retryAfter));
    }
    res.status(access.status).json({ error: access.error });
    return;
  }

  const apiKey = process.env.ELEVENLABS_API_KEY?.trim();
  const voiceId = process.env.ELEVENLABS_VOICE_ID?.trim() || "21m00Tcm4TlvDq8ikWAM";
  if (!apiKey) {
    res.status(503).json({ error: "Voice service is unavailable.", code: "voice_not_configured" });
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
        model_id: "eleven_flash_v2_5",
        voice_settings: { stability: 0.5, similarity_boost: 0.75, style: 0, use_speaker_boost: true },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      const body = await response.json().catch(() => null) as { detail?: { status?: unknown } } | null;
      const providerCode = typeof body?.detail?.status === "string" && /^[a-z][a-z0-9_]{0,63}$/.test(body.detail.status)
        ? body.detail.status : "provider_error";
      // Never log credentials, provider messages, or learner communication.
      console.error("Enhanced voice request failed", { status: response.status, code: providerCode });
      res.status(502).json({ error: "Enhanced voice is temporarily unavailable.", code: `voice_${providerCode}` });
      return;
    }

    if (!response.headers.get("content-type")?.startsWith("audio/")) {
      res.status(502).json({ error: "Voice service returned an invalid response.", code: "voice_invalid_response" });
      return;
    }

    const declaredLength = Number(response.headers.get("content-length") || 0);
    if (declaredLength > 5 * 1024 * 1024) {
      res.status(502).json({ error: "Voice response was too large." });
      return;
    }
    const audio = Buffer.from(await response.arrayBuffer());
    if (audio.byteLength > 5 * 1024 * 1024) {
      res.status(502).json({ error: "Voice response was too large." });
      return;
    }
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("Content-Length", String(audio.length));
    res.status(200).end(audio);
  } catch {
    res.status(502).json({ error: "Voice service failed." });
  }
}
