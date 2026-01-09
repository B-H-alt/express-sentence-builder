// api/replicate/generate.ts
import Replicate from "replicate";

export const config = {
  api: {
    bodyParser: { sizeLimit: "2mb" },
  },
};

// Download the generated image and return as a data URL so the client
// can store it locally (matching your current modal behavior).
async function urlToDataUrl(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl);
  if (!res.ok) throw new Error("Failed to download generated image.");

  const contentType = res.headers.get("content-type") || "image/webp";
  const arrayBuffer = await res.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  return `data:${contentType};base64,${base64}`;
}

// Single general PECS prompt that teaches the model
// how to visually extrapolate meaning from examples.
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
  // Auth-only, no image generation.
  // NOTE: replicate.models.get expects (model_owner, model_name, options?)
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
  // Health can be triggered by:
  // - GET  /api/replicate/generate?health=1
  // - POST /api/replicate/generate?health=1  (useful if GET is blocked upstream)
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

    // ---- HEALTH CHECK ----
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

    // ---- GENERATION ----
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

        // Prefer canonical square aspect ratio
        aspect_ratio: "1:1",

        // Conservative safety setting
        safety_tolerance: 2,

        // Prevent the model from "improving" the prompt creatively
        prompt_upsampling: false,

        // Smaller payload than PNG for base64 transport
        output_format: "webp",
        output_quality: 85,

        ...(typeof seed === "number" ? { seed } : {}),
      },
    });

    const url = Array.isArray(output) ? output[0] : (output as any);
    if (!url || typeof url !== "string") {
      res.status(500).json({ ok: false, error: "Model did not return an image URL." });
      return;
    }

    const dataUrl = await urlToDataUrl(url);
    res.status(200).json({ ok: true, dataUrl });
  } catch (err: any) {
    const status =
      err?.status || err?.response?.status || err?.cause?.status || 500;

    console.error("Replicate generate failed:", {
      status,
      message: err?.message,
      details: err?.response?.data ?? err?.body ?? err,
    });

    res.status(status).json({
      ok: false,
      error: err?.message || "Generation failed.",
      status,
    });
  }
}
