// api/generate.ts
import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = {
  api: {
    bodyParser: { sizeLimit: "2mb" },
  },
};

// Convert base64 image to data URL
function base64ToDataUrl(base64: string, mimeType: string) {
  return `data:${mimeType};base64,${base64}`;
}

function buildPecsPrompt(conceptRaw: string) {
  const concept = conceptRaw.trim();

  return `
PECS-style educational illustration representing the concept "${concept}".

Use the following examples as guidance for style and intent:
- Simple, child-friendly illustrations used in PECS cards
- Visual metaphors for abstract concepts
- One clear action or object that communicates meaning immediately

Style guidelines:
- Child-friendly storybook illustration style
- Soft shading and rounded shapes
- Bright but controlled colors
- Clean white background
- Centered subject with generous whitespace
- Square framing

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
      return res.status(405).send("Method Not Allowed");
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

    if (!apiKey) {
      return res
        .status(500)
        .send("Missing GOOGLE_GENERATIVE_AI_API_KEY");
    }

    const { prompt } = req.body as { prompt?: string };

    if (!prompt) {
      return res.status(400).send("Missing prompt.");
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // ⚠️ IMPORTANT: Use Nano Banana model
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash-image-preview", // Nano Banana equivalent image model
    });

    const pecsPrompt = buildPecsPrompt(prompt);

    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: pecsPrompt }],
        },
      ],
    });

    const response = await result.response;

    const imagePart = response.candidates?.[0]?.content?.parts?.find(
      (p: any) => p.inlineData
    );

    if (!imagePart?.inlineData?.data) {
      return res.status(500).send("No image returned.");
    }

    const base64 = imagePart.inlineData.data;
    const mimeType = imagePart.inlineData.mimeType || "image/png";

    const dataUrl = base64ToDataUrl(base64, mimeType);

    res.status(200).json({ dataUrl });
  } catch (err: any) {
    console.error(err);
    res.status(500).send(err?.message || "Generation failed.");
  }
}
