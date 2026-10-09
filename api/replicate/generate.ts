import Replicate from "replicate";
import { authorizeFeature, rejectUnlessPost, setPrivateApiHeaders } from "../_security.js";

export const config = {
  api: {
    bodyParser: { sizeLimit: "32kb" },
  },
};

const MAX_PROMPT_LENGTH = 240;
const MAX_IMAGE_BYTES = 8 * 1024 * 1024;

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

type ProviderError = {
  status?: number;
  message?: string;
  response?: { status?: number; data?: unknown };
  cause?: { status?: number };
};

async function urlToDataUrl(imageUrl: string): Promise<string> {
  const parsed = new URL(imageUrl);
  const isReplicateDeliveryHost = parsed.hostname === "replicate.delivery" || parsed.hostname.endsWith(".replicate.delivery");
  if (parsed.protocol !== "https:" || !isReplicateDeliveryHost) {
    throw new Error("Invalid image source.");
  }
  const res = await fetch(parsed, {
    redirect: "error",
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error("Failed to download generated image.");

  const contentType = res.headers.get("content-type")?.split(";")[0] || "";
  if (!['image/jpeg', 'image/png', 'image/webp'].includes(contentType)) {
    throw new Error("Generated file was not a supported image.");
  }
  const declaredLength = Number(res.headers.get("content-length") || 0);
  if (declaredLength > MAX_IMAGE_BYTES) throw new Error("Generated image was too large.");
  const arrayBuffer = await res.arrayBuffer();
  if (arrayBuffer.byteLength > MAX_IMAGE_BYTES) throw new Error("Generated image was too large.");
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  return `data:${contentType};base64,${base64}`;
}

function isImageLikeUrl(value: string): boolean {
  return /^https:\/\//i.test(value);
}

async function extractFirstImageUrl(value: unknown): Promise<string | null> {
  if (!value) return null;

  if (typeof value === "string") {
    return isImageLikeUrl(value) ? value : null;
  }

  if (value instanceof URL) {
    return value.href;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const nested = await extractFirstImageUrl(item);
      if (nested) return nested;
    }
    return null;
  }

  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;

    if (typeof obj.url === "string" && isImageLikeUrl(obj.url)) return obj.url;
    if (typeof obj.href === "string" && isImageLikeUrl(obj.href)) return obj.href;

    if (typeof obj.url === "function") {
      try {
        const maybeUrl = await (obj.url as () => Promise<unknown> | unknown)();
        const nested = await extractFirstImageUrl(maybeUrl);
        if (nested) return nested;
      } catch {
        // Ignore url() resolution failures and continue scanning nested fields.
      }
    }

    for (const key of ["image", "image_url", "images", "output", "data", "result", "files", "urls"]) {
      if (key in obj) {
        const nested = await extractFirstImageUrl(obj[key]);
        if (nested) return nested;
      }
    }
  }

  return null;
}

function buildPecsPrompt(conceptRaw: string) {
  const concept = conceptRaw.trim();

  return `
PECS-style educational illustration representing the concept "${concept}".

Use the following examples as guidance for style and intent:
- Simple, child-friendly illustrations used in PECS cards
- Visual metaphors for abstract concepts (for example: pointing to a wrist to mean "now")
- One clear action or object that communicates meaning immediately

Style guidelines:
- Child-friendly storybook illustration style
- Soft shading and rounded shapes
- Bright but controlled colors
- Clean white background
- Centered subject with generous whitespace
- Square, card-like framing

Content rules:
- Depict the concept visually using a simple, concrete action or object
- One clear subject and one clear idea only
- Make the meaning understandable without reading or explanation

Strict constraints:
- No text
- No letters
- No numbers
- No symbols
- No watermark
- No logo
`.trim();
}

export default async function handler(req: ApiRequest, res: ApiResponse) {
  setPrivateApiHeaders(res);
  if (rejectUnlessPost(req, res)) return;

  try {
    const { prompt, seed } = (req.body ?? {}) as { prompt?: string; seed?: number };
    if (!prompt || typeof prompt !== "string" || !prompt.trim() || prompt.length > MAX_PROMPT_LENGTH) {
      res.status(400).json({ ok: false, error: "Invalid prompt." });
      return;
    }

    const access = await authorizeFeature(req, "image_generation", 1);
    if (!access.ok) {
      res.status(access.status).json({ ok: false, error: access.error });
      return;
    }

    const token = process.env.REPLICATE_API_TOKEN;

    if (!token) {
      res.status(503).json({
        ok: false,
        error: "Image generation is unavailable.",
      });
      return;
    }

    const replicate = new Replicate({ auth: token });

    const pecsPrompt = buildPecsPrompt(prompt);

    const output = await replicate.run("black-forest-labs/flux-1.1-pro", {
      input: {
        prompt: pecsPrompt,
        aspect_ratio: "1:1",
        safety_tolerance: 2,
        prompt_upsampling: false,
        output_format: "webp",
        output_quality: 85,
        ...(typeof seed === "number" ? { seed } : {}),
      },
    });

    const url = await extractFirstImageUrl(output);
    if (!url) {
      res.status(502).json({ ok: false, error: "Image generation failed." });
      return;
    }

    const dataUrl = await urlToDataUrl(url);
    res.status(200).json({ ok: true, dataUrl });
  } catch (error: unknown) {
    const err = error && typeof error === "object" ? error as ProviderError : {};
    const status = err.status || err.response?.status || err.cause?.status || 500;

    if (status === 401) {
      res.status(502).json({
        ok: false,
        error: "Image generation failed.",
      });
      return;
    }

    console.error("Replicate generate failed:", {
      status,
      message: typeof err?.message === "string" ? err.message.slice(0, 200) : "Unknown provider error",
    });

    res.status(status >= 400 && status < 500 ? status : 502).json({
      ok: false,
      error: "Image generation failed.",
    });
  }
}
