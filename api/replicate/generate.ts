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

export default async function handler(req: any, res: any) {
  try {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    // ---- ENV GUARDS (helps diagnose Vercel Preview vs Production vs typo) ----
    const token = process.env.REPLICATE_API_TOKEN;

    if (!token) {
      // Do NOT print the token; just confirm presence/absence.
      console.error(
        "Missing REPLICATE_API_TOKEN. Check Vercel Environment Variables scope (Preview/Production/Development) and redeploy."
      );
      res
        .status(500)
        .send(
          "Server misconfigured: missing REPLICATE_API_TOKEN. Check Vercel env scope and redeploy."
        );
      return;
    }

    // Optional: minimal log to confirm it's present in this deployment
    console.log("REPLICATE_API_TOKEN present:", Boolean(token));
    // ------------------------------------------------------------------------

    const { prompt, seed } = req.body as {
      prompt?: string;
      seed?: number;
    };

    if (!prompt || typeof prompt !== "string") {
      res.status(400).send("Missing prompt.");
      return;
    }

    // Initialize Replicate *after* reading env (helps some deploy setups)
    const replicate = new Replicate({ auth: token });

    const pecsPrompt = buildPecsPrompt(prompt);

    const output = await replicate.run("black-forest-labs/flux-1.1-pro", {
      input: {
        prompt: pecsPrompt,

        // Force square PECS-card framing
        aspect_ratio: "custom",
        width: 768,
        height: 768,

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
      res.status(500).send("Model did not return an image URL.");
      return;
    }

    const dataUrl = await urlToDataUrl(url);
    res.status(200).json({ dataUrl });
  } catch (err: any) {
    console.error(err);

    // Bubble up the most likely HTTP status if the SDK provides it
    const status =
      err?.status ||
      err?.response?.status ||
      err?.cause?.status ||
      500;

    res.status(status).send(err?.message || "Generation failed.");
  }
}
