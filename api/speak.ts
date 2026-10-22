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
  write: (body: Uint8Array) => boolean;
  once: (event: string, listener: () => void) => void;
  off: (event: string, listener: () => void) => void;
  destroy: () => void;
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

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  const disconnected = () => controller.abort();
  res.once("close", disconnected);
  let streaming = false;
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}/stream`, {
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
      signal: controller.signal,
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
    if (!response.body) throw new Error("Missing audio stream");
    res.setHeader("Content-Type", "audio/mpeg");
    res.setHeader("X-Accel-Buffering", "no");
    res.status(200);
    const reader = response.body.getReader();
    let bytes = 0;
    try {
      while (true) {
        controller.signal.throwIfAborted();
        const { value, done } = await reader.read();
        controller.signal.throwIfAborted();
        if (done) break;
        bytes += value.byteLength;
        if (bytes > 5 * 1024 * 1024) throw new Error("Audio response too large");
        streaming = true;
        if (!res.write(value)) {
          await new Promise<void>((resolve, reject) => {
            const cleanup = () => { res.off("drain", drained); controller.signal.removeEventListener("abort", aborted); };
            const drained = () => { cleanup(); resolve(); };
            const aborted = () => { cleanup(); reject(new Error("Voice stream aborted")); };
            if (controller.signal.aborted) { reject(new Error("Voice stream aborted")); return; }
            res.once("drain", drained);
            controller.signal.addEventListener("abort", aborted, { once: true });
          });
        }
      }
      if (!bytes) throw new Error("Empty audio response");
      res.end();
    } finally {
      await reader.cancel().catch(() => {});
      reader.releaseLock();
    }
  } catch {
    if (streaming) res.destroy();
    else {
      res.setHeader("Content-Type", "application/json; charset=utf-8");
      res.status(502).json({ error: "Voice service failed." });
    }
  } finally {
    clearTimeout(timeout);
    controller.abort();
    res.off("close", disconnected);
  }
}
