// src/components/pecs/AddCardModal.tsx
import React, { useState } from "react";
import { useCardStore } from "@/store/cardStore";
import { X, UploadCloud, Image as ImageIcon, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddCardModalProps {
  open: boolean;
  onClose: () => void;
}

type ImageMode = "upload" | "generate";

export const AddCardModal: React.FC<AddCardModalProps> = ({ open, onClose }) => {
  const addCustomCard = useCardStore((s) => s.addCustomCard);
  const currentLevel = useCardStore((s) => s.currentLevel);

  const [text, setText] = useState("");
  const [category, setCategory] = useState("people");
  const [imageUrl, setImageUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Generate mode state
  const [imageMode, setImageMode] = useState<ImageMode>("upload");
  const [genPrompt, setGenPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);

  // IMPORTANT: keep this AFTER hooks so hook order never changes
  if (!open) return null;

  const resetState = () => {
    setText("");
    setCategory("people");
    setImageUrl("");
    setIsDragging(false);

    setImageMode("upload");
    setGenPrompt("");
    setIsGenerating(false);
    setGenError(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    addCustomCard({
      text: text.trim(),
      category,
      imageUrl: imageUrl.trim() || undefined,
    });

    resetState();
    onClose();
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImageUrl(result);
      setGenError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    handleFile(file || null);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const clearImage = () => {
    setImageUrl("");
    setGenError(null);
  };

  // Build a PECS-safe prompt *without useMemo*
  const buildEffectivePrompt = () => {
    const raw = (genPrompt.trim() || text.trim()).trim();
    if (!raw) return "";

    return [
      raw,
      "PECS-style educational illustration",
      "child-friendly storybook illustration style",
      "soft shading and rounded shapes",
      "clean white background",
      "centered subject with generous whitespace",
      "one clear action or object only",
      "no text",
      "no letters",
      "no numbers",
      "no symbols",
      "no watermark",
      "no logo",
    ].join(", ");
  };

  const generateImage = async () => {
    setGenError(null);

    const effectivePrompt = buildEffectivePrompt();
    if (!effectivePrompt) {
      setGenError("Enter a prompt (or fill in the card label) to generate an image.");
      return;
    }

    try {
      setIsGenerating(true);

      const resp = await fetch("/api/replicate/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: effectivePrompt,
          // aspect_ratio handled server-side; kept here if you later want it
          aspect_ratio: "1:1",
        }),
      });

      if (!resp.ok) {
        const msg = await resp.text();
        throw new Error(msg || "Failed to generate image.");
      }

      const data = (await resp.json()) as { dataUrl?: string; imageUrl?: string };

      if (data.dataUrl) setImageUrl(data.dataUrl);
      else if (data.imageUrl) setImageUrl(data.imageUrl);
      else throw new Error("No image returned from server.");
    } catch (err: any) {
      setGenError(err?.message || "Failed to generate image.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
        <form
          onSubmit={handleSubmit}
          className="relative w-full max-w-md rounded-3xl bg-background border border-border/70 shadow-2xl p-6 space-y-4"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            className="absolute right-3 top-3 rounded-full border border-border/60 p-1 hover:bg-muted transition-colors"
            onClick={() => {
              resetState();
              onClose();
            }}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-1 pr-6">
            <h2 className="text-lg font-semibold">Add custom card</h2>
            <p className="text-xs text-muted-foreground">
              This card will be saved at Level {currentLevel} and will appear with the other cards.
            </p>
          </div>

          <div className="space-y-3">
            {/* Label */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Card label</label>
              <input
                className="w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm"
                placeholder="e.g. Grandma, Cookie, Therapy, Bus"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Category</label>
              <select
                className="w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="people">People</option>
                <option value="feelings">Feelings</option>
                <option value="actions">Actions</option>
                <option value="objects">Objects</option>
                <option value="places">Places</option>
                <option value="social">Social</option>
                <option value="food">Food</option>
                <option value="activities">Activities</option>
                <option value="descriptive">Descriptive</option>
                <option value="time">Time</option>
              </select>
            </div>

            {/* Image section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">Card image</label>

                <div className="flex rounded-xl border border-border overflow-hidden">
                  <button
                    type="button"
                    className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                      imageMode === "upload" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
                    }`}
                    onClick={() => setImageMode("upload")}
                  >
                    Upload
                  </button>
                  <button
                    type="button"
                    className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                      imageMode === "generate" ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted/50"
                    }`}
                    onClick={() => setImageMode("generate")}
                  >
                    Generate
                  </button>
                </div>
              </div>

              {/* Preview */}
              {imageUrl ? (
                <div className="w-full rounded-2xl border border-border bg-background/60 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                        <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Image selected.
                        <div className="mt-1">Upload or generate another to replace.</div>
                      </div>
                    </div>

                    <Button type="button" variant="ghost" className="rounded-xl" onClick={clearImage}>
                      Remove
                    </Button>
                  </div>
                </div>
              ) : null}

              {/* Upload mode */}
              {imageMode === "upload" && (
                <>
                  <div
                    className={`w-full rounded-2xl border border-dashed px-3 py-4 text-xs flex flex-col items-center gap-2 text-muted-foreground cursor-pointer transition-colors
                      ${isDragging ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50"}`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => {
                      const input = document.getElementById("add-card-file-input") as HTMLInputElement | null;
                      input?.click();
                    }}
                  >
                    <UploadCloud className="w-5 h-5" />
                    <span>Drag &amp; drop an image here, or click to browse</span>
                  </div>

                  <input
                    id="add-card-file-input"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFile(e.target.files?.[0] || null)}
                  />

                  <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                    <ImageIcon className="w-3 h-3" />
                    You can upload from your device. Uploaded images are stored locally for this browser.
                  </p>
                </>
              )}

              {/* Generate mode */}
              {imageMode === "generate" && (
                <div className="space-y-2">
                  <input
                    className="w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm"
                    placeholder='Describe the image (e.g. "cookie", "school bus", "brush hair")'
                    value={genPrompt}
                    onChange={(e) => setGenPrompt(e.target.value)}
                    disabled={isGenerating}
                  />

                  {genError ? (
                    <div className="text-xs text-destructive">{genError}</div>
                  ) : (
                    <p className="text-[11px] text-muted-foreground">
                      Tip: simple prompts work best. We enforce PECS-friendly style and “no text.”
                    </p>
                  )}

                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      className="rounded-xl gap-2"
                      onClick={generateImage}
                      disabled={isGenerating || (!genPrompt.trim() && !text.trim())}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Generating…
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4" />
                          Generate image
                        </>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      className="rounded-xl"
                      onClick={() => {
                        setGenPrompt("");
                        setGenError(null);
                      }}
                      disabled={isGenerating}
                    >
                      Clear
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl"
              onClick={() => {
                resetState();
                onClose();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl" disabled={!text.trim()}>
              Save card
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};
