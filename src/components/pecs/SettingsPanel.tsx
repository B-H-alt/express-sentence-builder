// src/components/pecs/SettingsPanel.tsx
import React, { useEffect, useRef, useState } from "react";
import { useCardStore } from "@/store/cardStore";
import { X, User, SunMoon, Plus, Layers, Upload, Trash2, Save } from "lucide-react";
import { AddCardModal } from "@/components/pecs/AddCardModal";
import { Button } from "@/components/ui/button";
import type { VocabularyLevel } from "@/store/cardStore";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const levelOptions: { level: VocabularyLevel; label: string; subtitle: string }[] = [
  { level: 1, label: "Level 1 – Beginner", subtitle: "Smaller starter set (about 30 cards)" },
  { level: 2, label: "Level 2 – Intermediate", subtitle: "Expanded vocabulary (about 75 cards)" },
  { level: 3, label: "Level 3 – Advanced", subtitle: "Full set (about 150 cards)" },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ open, onClose }) => {
  const { currentLevel, setLevel } = useCardStore();

  const userName = useCardStore((s) => s.userName);
  const userImage = useCardStore((s) => s.userImage);
  const updateUserProfile = useCardStore((s) => s.updateUserProfile);

  const [showAddCard, setShowAddCard] = useState(false);

  const [draftName, setDraftName] = useState("Me");
  const [draftImage, setDraftImage] = useState<string | null>(null);

  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraftName(userName?.trim() || "Me");
    setDraftImage(userImage ?? null);
  }, [open, userName, userImage]);

  if (!open) return null;

  const hasChanges =
    (draftName.trim() || "Me") !== (userName?.trim() || "Me") ||
    (draftImage ?? null) !== (userImage ?? null);

  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setDraftImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateUserProfile(draftName.trim() || "Me", draftImage);
  };

  const handleRemovePhoto = () => {
    setDraftImage(null);
    updateUserProfile(draftName.trim() || "Me", null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div
          className="relative w-full max-w-4xl rounded-3xl bg-background shadow-2xl border border-border/60 p-6 md:p-8 flex flex-col gap-6 md:gap-8"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="absolute right-4 top-4 rounded-full border border-border/60 p-1 hover:bg-muted transition-colors"
            onClick={onClose}
            type="button"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="space-y-1 pr-10">
            <h2 className="text-xl md:text-2xl font-semibold">Settings</h2>
            <p className="text-sm text-muted-foreground">
              Personalize Expressly for your learner.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-[minmax(0,1.1fr)_minmax(0,1.3fr)]">
            {/* Left column: Profile / Theme */}
            <div className="rounded-2xl border border-border/80 bg-muted/40 p-5 flex flex-col gap-5">
              {/* Profile */}
              <div className="flex flex-col items-center gap-3">
                <div className="w-24 h-24 rounded-full bg-background shadow-inner border border-border/60 flex items-center justify-center overflow-hidden">
                  {draftImage ? (
                    <img src={draftImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePickImage}
                  className="hidden"
                />

                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={() => fileRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Change
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemovePhoto}
                    disabled={!draftImage}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>

              {/* Username */}
              <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Username</label>
                <input
                  className="w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm text-foreground"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Me"
                />
              </div>

              <div className="flex justify-end">
                <Button type="button" onClick={handleSave} disabled={!hasChanges}>
                  <Save className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>

              {/* Theme placeholder */}
              <div className="space-y-2 mt-auto">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-muted-foreground">Theme</span>
                  <span className="text-[11px] text-muted-foreground">Light / Dark – coming soon</span>
                </div>
                <button
                  className="flex items-center justify-between w-full rounded-xl border border-dashed border-border/70 px-3 py-2 text-sm text-muted-foreground cursor-not-allowed"
                  type="button"
                  disabled
                >
                  <span>Light</span>
                  <SunMoon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right column: Level + Add Card */}
            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 flex flex-col gap-3">
                <div className="flex items-center gap-2 mb-1">
                  <Layers className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">Vocabulary level</h3>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  Choose how many cards appear in the PECS board.
                </p>

                <div className="space-y-1.5">
                  {levelOptions.map((opt) => (
                    <button
                      key={opt.level}
                      type="button"
                      onClick={() => setLevel(opt.level)}
                      className={`w-full text-left rounded-xl px-3 py-2 text-sm flex items-start gap-2 border transition-colors ${
                        currentLevel === opt.level
                          ? "border-primary/70 bg-primary/5"
                          : "border-border hover:bg-muted/60"
                      }`}
                    >
                      <span className="mt-[2px] text-xs">
                        {currentLevel === opt.level ? "✓" : "○"}
                      </span>
                      <span>
                        <span className={`font-medium ${currentLevel === opt.level ? "text-primary" : ""}`}>
                          {opt.label}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          {opt.subtitle}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold">Add a custom card</h3>
                    <p className="text-xs text-muted-foreground">
                      Create your own picture card at the current level.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddCard(true)}
                  className="mt-2 w-full rounded-2xl border border-dashed border-primary/40 bg-primary/5 py-6 flex flex-col items-center justify-center gap-3 hover:bg-primary/10 transition-colors"
                >
                  <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center">
                    <Plus className="w-7 h-7 text-primary-foreground" />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    Tap to add a new card (label, category, image URL)
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <AddCardModal open={showAddCard} onClose={() => setShowAddCard(false)} />
      </div>
    </>
  );
};
