// src/components/pecs/AddCardModal.tsx
import React, { useState } from "react";
import { useCardStore } from "@/store/cardStore";
import { X, UploadCloud, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface AddCardModalProps {
  open: boolean;
  onClose: () => void;
}

export const AddCardModal: React.FC<AddCardModalProps> = ({ open, onClose }) => {
  const addCustomCard = useCardStore((s) => s.addCustomCard);
  const currentLevel = useCardStore((s) => s.currentLevel);

  const [text, setText] = useState("");
  const [category, setCategory] = useState("people");
  const [imageUrl, setImageUrl] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  if (!open) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    addCustomCard({
      text: text.trim(),
      category,
      imageUrl: imageUrl.trim() || undefined,
      // image is left undefined – we use imageUrl for custom cards
    });

    setText("");
    setCategory("people");
    setImageUrl("");
    setIsDragging(false);
    onClose();
  };

  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setImageUrl(result); // data URL stored + persisted
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
            onClick={onClose}
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
              <label className="text-xs font-medium text-muted-foreground">
                Card label
              </label>
              <input
                className="w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm"
                placeholder="e.g. Grandma, Cookie, Therapy, Bus"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
            </div>

            {/* Category */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">
                Category
              </label>
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

            {/* Image upload / drag-and-drop */}
            <div className="space-y-1">

              {/* Dropzone */}
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
                {imageUrl ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted flex items-center justify-center">
                      <img
                        src={imageUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span>Image selected. Drag a new one to replace.</span>
                  </div>
                ) : (
                  <>
                    <UploadCloud className="w-5 h-5" />
                    <span>Drag &amp; drop an image here, or click to browse</span>
                  </>
                )}
              </div>

              {/* Hidden file input */}
              <input
                id="add-card-file-input"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFile(e.target.files?.[0] || null)}
              />

              

              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ImageIcon className="w-3 h-3" />
                You can upload from your device. Uploaded images
                are stored locally for this browser.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="rounded-xl"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-xl"
              disabled={!text.trim()}
            >
              Save card
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};
