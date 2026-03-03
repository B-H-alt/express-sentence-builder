import Replicate from "replicate";

export const config = {
  api: {
    bodyParser: { sizeLimit: "2mb" },
  },
};

async function urlToDataUrl(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error("Failed to download generated image.");

  const contentType = res.headers.get("content-type") || "image/webp";
  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  return `data:${contentType};base64,${base64}`;
}

function isImageLikeUrl(value: string): boolean {
  return /^https?:\/\//i.test(value) || value.startsWith("data:image/");
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

async function runReplicateHealthCheck(replicate: Replicate) {
  const model = await replicate.models.get("black-forest-labs", "flux-1.1-pro");

  return {
    ok: true,
    model: {
      owner: (model as any)?.owner ?? "black-forest-labs",
      name: (model as any)?.name ?? "flux-1.1-pro",
    },
  };
}

export default async function handler(req: any, res: any) {
  const isHealth = Boolean(req?.query?.health);

  try {
    const token = process.env.REPLICATE_API_TOKEN;

    if (!token) {
      res.status(500).json({
        ok: false,
        error: "Missing REPLICATE_API_TOKEN",
        hint:
          "Set REPLICATE_API_TOKEN in your deployment environment variables (correct scope) and redeploy.",
        method: req.method,
        health: isHealth,
      });
      return;
    }

    const replicate = new Replicate({ auth: token });

    if (isHealth) {
      try {
        const health = await runReplicateHealthCheck(replicate);
        res.status(200).json({
          ok: true,
          tokenPresent: true,
          replicate: health,
          method: req.method,
        });
      } catch (err: any) {
        const status =
          err?.status || err?.response?.status || err?.cause?.status || 500;

        console.error("Replicate health check failed:", {
          status,
          message: err?.message,
          details: err?.response?.data ?? err?.body ?? err,
        });

        res.status(status).json({
          ok: false,
          tokenPresent: true,
          error: err?.message || "Health check failed",
          status,
          method: req.method,
        });
      }
      return;
    }

    if (req.method !== "POST") {
      res.status(405).json({
        ok: false,
        error: "Method Not Allowed",
        allowed: ["POST"],
        hint:
          "To debug, visit /api/replicate/generate?health=1 (GET) or call it with POST if GET is blocked.",
        method: req.method,
      });
      return;
    }

    const { prompt, seed } = req.body as { prompt?: string; seed?: number };

    if (!prompt || typeof prompt !== "string") {
      res.status(400).json({ ok: false, error: "Missing prompt." });
      return;
    }

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
      const outputType = Array.isArray(output) ? "array" : typeof output;
      const outputKeys =
        output && typeof output === "object" && !Array.isArray(output)
          ? Object.keys(output as Record<string, unknown>).slice(0, 10)
          : [];

      res.status(500).json({
        ok: false,
        error: "Model did not return an image URL.",
        debug: { outputType, outputKeys },
      });
      return;
    }

    const dataUrl = url.startsWith("data:image/") ? url : await urlToDataUrl(url);
    res.status(200).json({ ok: true, dataUrl });
  } catch (err: any) {
    const status = err?.status || err?.response?.status || err?.cause?.status || 500;
    const upstreamMessage =
      err?.response?.data?.detail ||
      err?.response?.data?.title ||
      err?.message ||
      "Generation failed.";

    if (status === 401) {
      res.status(401).json({
        ok: false,
        error: "Replicate authentication failed.",
        hint: "Set a valid REPLICATE_API_TOKEN for the runtime and restart/redeploy.",
        status,
        upstream: upstreamMessage,
      });
      return;
    }

    console.error("Replicate generate failed:", {
      status,
      message: err?.message,
      details: err?.response?.data ?? err?.body ?? err,
    });

    res.status(status).json({
      ok: false,
      error: upstreamMessage,
      status,
    });
  }
}
