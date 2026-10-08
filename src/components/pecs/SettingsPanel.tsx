// src/components/pecs/SettingsPanel.tsx
import React, { useEffect, useRef, useState } from "react";
import { useCardStore } from "@/store/cardStore";
import { X, User, Plus, Layers, Upload, Trash2, Save, Leaf, Volume2, Palette, MessagesSquare, Moon, Sun } from "lucide-react";
import { AddCardModal } from "@/components/pecs/AddCardModal";
import { Button } from "@/components/ui/button";
import type { CardDisplayAmount, CharacterGender, TextSize, VocabularyLevel } from "@/store/cardStore";
import { useTheme } from "next-themes";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const levelOptions: { level: VocabularyLevel; label: string; subtitle: string }[] = [
  { level: 1, label: "Level 1 (Beginner)", subtitle: "Smaller starter set (about 30 cards)" },
  { level: 2, label: "Level 2 (Intermediate)", subtitle: "Expanded vocabulary (about 75 cards)" },
  { level: 3, label: "Level 3 (Advanced)", subtitle: "Full set (about 150 cards)" },
];

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ open, onClose }) => {
  const {
    currentLevel,
    setLevel,
    cardsPerPage,
    setCardsPerPage,
    lowStimulationMode,
    setLowStimulationMode,
    textSize,
    setTextSize,
    speechRate,
    setSpeechRate,
    speechVolume,
    setSpeechVolume,
  } = useCardStore();
  const { theme, setTheme } = useTheme();
  const activeTheme = theme ?? "light";
  const darkAppearance = activeTheme === "dark" || activeTheme.endsWith("-dark");
  const currentPalette = activeTheme === "light" || activeTheme === "dark"
    ? "blue"
    : activeTheme.replace(/-dark$/, "");
  const setAppearance = (palette: string, dark: boolean) => {
    if (palette === "blue") {
      setTheme(dark ? "dark" : "light");
      return;
    }
    setTheme(dark ? `${palette}-dark` : palette);
  };

  const userName = useCardStore((s) => s.userName);
  const userImage = useCardStore((s) => s.userImage);
  const updateUserProfile = useCardStore((s) => s.updateUserProfile);
  const characterGender = useCardStore((s) => s.characterGender);
  const setCharacterGender = useCardStore((s) => s.setCharacterGender);

  const [showAddCard, setShowAddCard] = useState(false);
  const [activeSection, setActiveSection] = useState<"profile" | "display" | "cards">("profile");

  const [draftName, setDraftName] = useState("Me");
  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [draftGender, setDraftGender] = useState<CharacterGender>("girl");

  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setActiveSection("profile");
    setDraftName(userName?.trim() || "Me");
    setDraftImage(userImage ?? null);
    setDraftGender(characterGender);
  }, [open, userName, userImage, characterGender]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const hasChanges =
    (draftName.trim() || "Me") !== (userName?.trim() || "Me") ||
    (draftImage ?? null) !== (userImage ?? null) ||
    draftGender !== characterGender;

  const handlePickImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setDraftImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    updateUserProfile(draftName.trim() || "Me", draftImage);
    setCharacterGender(draftGender);
    onClose();
  };

  const handleRemovePhoto = () => {
    setDraftImage(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      <div
        className="fixed inset-0 z-[90] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
          className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border/70 bg-background px-6 py-4 md:px-8">
            <div className="min-w-0">
              <h2 id="settings-title" className="text-xl font-semibold md:text-2xl">Settings</h2>
              <p className="truncate text-sm text-muted-foreground">
                Personalize Expressly for your learner.
              </p>
            </div>
            <button
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/60 hover:bg-muted transition-colors"
              onClick={onClose}
              type="button"
              aria-label="Close settings"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 md:p-8">
            <div
              role="tablist"
              aria-label="Settings sections"
              className="mb-6 grid grid-cols-3 gap-1 rounded-2xl border border-border/70 bg-muted/40 p-1.5"
            >
              {[
                { id: "profile", label: "Profile", icon: User },
                { id: "display", label: "Display", icon: Palette },
                { id: "cards", label: "Cards & voice", icon: MessagesSquare },
              ].map((section) => {
                const Icon = section.icon;
                const selected = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveSection(section.id as "profile" | "display" | "cards")}
                    className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-sm font-medium transition-colors ${
                      selected
                        ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                        : "text-muted-foreground hover:bg-background/60 hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{section.label}</span>
                  </button>
                );
              })}
            </div>

            <div className={`grid gap-6 ${activeSection === "display" ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]" : "mx-auto max-w-2xl"}`}>
            {/* Left column: Profile / Theme */}
            <div className={`rounded-2xl border border-border/80 bg-muted/40 p-5 flex flex-col gap-5 ${activeSection === "cards" ? "hidden" : ""}`}>
              {/* Profile */}
              {activeSection === "profile" && <div className="flex flex-col items-center gap-3">
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
              </div>}

              {/* Username */}
              {activeSection === "profile" && <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Username</label>
                <input
                  className="w-full rounded-xl border border-border bg-background/70 px-3 py-2 text-sm text-foreground"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Me"
                />
              </div>}

              {/* Card character */}
              {activeSection === "profile" && <div className="space-y-2">
                <label className="text-xs font-medium text-muted-foreground">Card character</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["girl", "boy"] as CharacterGender[]).map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      aria-pressed={draftGender === gender}
                      onClick={() => setDraftGender(gender)}
                      className={`h-10 rounded-xl border text-sm font-medium capitalize transition-colors ${
                        draftGender === gender
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background/70 text-foreground hover:bg-muted"
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Choose which character appears on applicable communication cards.
                </p>
              </div>}

              {/* Theme */}
              {activeSection === "display" && <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Color theme</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Choose the colors that feel most comfortable.</p>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-background/70 p-3">
                  <div>
                    <h4 className="text-sm font-medium">Appearance</h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">Use any color theme in light or dark mode.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setAppearance(currentPalette, false)}
                      className={`inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-medium transition-colors hover:bg-muted ${
                        darkAppearance ? "text-muted-foreground" : "text-primary"
                      }`}
                      aria-label="Use light mode"
                    >
                      <Sun className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Light</span>
                    </button>
                    <button
                      type="button"
                      role="switch"
                      aria-label="Dark mode"
                      aria-checked={darkAppearance}
                      onClick={() => setAppearance(currentPalette, !darkAppearance)}
                      className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        darkAppearance ? "border-primary bg-primary" : "border-border bg-muted"
                      }`}
                    >
                      <span
                        className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
                          darkAppearance ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => setAppearance(currentPalette, true)}
                      className={`inline-flex min-h-9 items-center gap-1 rounded-lg px-2 text-xs font-medium transition-colors hover:bg-muted ${
                        darkAppearance ? "text-primary" : "text-muted-foreground"
                      }`}
                      aria-label="Use dark mode"
                    >
                      <Moon className="h-4 w-4" aria-hidden="true" />
                      <span className="hidden sm:inline">Dark</span>
                    </button>
                  </div>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    aria-pressed={currentPalette === "blue"}
                    onClick={() => setAppearance("blue", darkAppearance)}
                    className={`min-h-20 rounded-xl border p-3 text-sm font-medium flex flex-col items-start justify-between gap-2 transition-colors ${
                      currentPalette === "blue"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background/70 text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="flex gap-1.5" aria-hidden="true">
                      <span className="h-4 w-4 rounded-full bg-[#17358a]" />
                      <span className="h-4 w-4 rounded-full bg-[#19b9c3]" />
                      <span className="h-4 w-4 rounded-full bg-white ring-1 ring-black/10" />
                    </span>
                    Expressly Blue
                  </button>
                  <button
                    type="button"
                    aria-pressed={currentPalette === "warm"}
                    onClick={() => setAppearance("warm", darkAppearance)}
                    className={`min-h-20 rounded-xl border p-3 text-sm font-medium flex flex-col items-start justify-between gap-2 transition-colors ${
                      currentPalette === "warm"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background/70 text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="flex gap-1.5" aria-hidden="true">
                      <span className="h-4 w-4 rounded-full bg-[#8b4d2b]" />
                      <span className="h-4 w-4 rounded-full bg-[#4e7e6b]" />
                      <span className="h-4 w-4 rounded-full bg-[#f5ead4] ring-1 ring-black/10" />
                    </span>
                    Warm
                  </button>
                  <button
                    type="button"
                    aria-pressed={currentPalette === "sage"}
                    onClick={() => setAppearance("sage", darkAppearance)}
                    className={`min-h-20 rounded-xl border p-3 text-sm font-medium flex flex-col items-start justify-between gap-2 transition-colors ${
                      currentPalette === "sage"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background/70 text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="flex gap-1.5" aria-hidden="true">
                      <span className="h-4 w-4 rounded-full bg-[#496b51]" />
                      <span className="h-4 w-4 rounded-full bg-[#b28b59]" />
                      <span className="h-4 w-4 rounded-full bg-[#eef3eb] ring-1 ring-black/10" />
                    </span>
                    Sage
                  </button>
                  <button
                    type="button"
                    aria-pressed={currentPalette === "lavender"}
                    onClick={() => setAppearance("lavender", darkAppearance)}
                    className={`min-h-20 rounded-xl border p-3 text-sm font-medium flex flex-col items-start justify-between gap-2 transition-colors ${
                      currentPalette === "lavender"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background/70 text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="flex gap-1.5" aria-hidden="true">
                      <span className="h-4 w-4 rounded-full bg-[#68578f]" />
                      <span className="h-4 w-4 rounded-full bg-[#a96f94]" />
                      <span className="h-4 w-4 rounded-full bg-[#f3eff8] ring-1 ring-black/10" />
                    </span>
                    Lavender
                  </button>
                  <button
                    type="button"
                    aria-pressed={currentPalette === "rose"}
                    onClick={() => setAppearance("rose", darkAppearance)}
                    className={`min-h-20 rounded-xl border p-3 text-sm font-medium flex flex-col items-start justify-between gap-2 transition-colors ${
                      currentPalette === "rose"
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-background/70 text-foreground hover:bg-muted"
                    }`}
                  >
                    <span className="flex gap-1.5" aria-hidden="true">
                      <span className="h-4 w-4 rounded-full bg-[#8b4b61]" />
                      <span className="h-4 w-4 rounded-full bg-[#bd7d64]" />
                      <span className="h-4 w-4 rounded-full bg-[#f8eeee] ring-1 ring-black/10" />
                    </span>
                    Rose
                  </button>
                </div>
                <div className="rounded-xl border border-border bg-background/70 p-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex min-w-0 gap-3">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Leaf className="h-4 w-4" />
                      </span>
                      <div>
                        <h3 className="text-sm font-semibold">Calm mode</h3>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground">
                          Calmer colors, less movement, lighter shadows, and fewer cards at once.
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      data-low-stimulation-switch
                      aria-checked={lowStimulationMode}
                      onClick={() => setLowStimulationMode(!lowStimulationMode)}
                      className={`relative mt-1 h-7 w-12 shrink-0 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
                        lowStimulationMode
                          ? "border-primary bg-primary"
                          : "border-border bg-muted"
                      }`}
                    >
                      <span
                        className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out ${
                          lowStimulationMode ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                      <span className="sr-only">Calm mode</span>
                    </button>
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-background/70 p-3">
                  <div>
                    <h3 className="text-sm font-semibold">Text size</h3>
                    <p className="mt-1 text-xs text-muted-foreground">Make words throughout Expressly easier to read.</p>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2" aria-label="Text size">
                    {([
                      { value: "small", label: "Small", sample: "A" },
                      { value: "default", label: "Default", sample: "A" },
                      { value: "large", label: "Large", sample: "A" },
                    ] as { value: TextSize; label: string; sample: string }[]).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={textSize === option.value}
                        onClick={() => setTextSize(option.value)}
                        className={`flex min-h-14 items-center justify-center gap-1.5 rounded-xl border px-2 font-medium transition-colors ${
                          textSize === option.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        }`}
                      >
                        <span className={option.value === "small" ? "text-xs" : option.value === "large" ? "text-xl" : "text-base"} aria-hidden="true">
                          {option.sample}
                        </span>
                        <span className="text-xs">{option.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>}
            </div>

            {/* Right column: Level + Add Card */}
            <div className={`flex flex-col gap-4 ${activeSection === "profile" ? "hidden" : ""}`}>
              {activeSection === "display" && <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 flex flex-col gap-3">
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
              </div>}

              {activeSection === "display" && <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 flex flex-col gap-3">
                <div>
                  <h3 className="text-sm font-semibold">Card size</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Larger cards show fewer choices at once. Page buttons appear when needed.
                  </p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {([
                    { amount: 4, label: "Large", count: "4" },
                    { amount: 8, label: "Medium", count: "8" },
                    { amount: 12, label: "Small", count: "12" },
                    { amount: "all", label: "Compact", count: "All" },
                  ] as { amount: CardDisplayAmount; label: string; count: string }[]).map(({ amount, label, count }) => (
                    <button
                      key={amount}
                      type="button"
                      aria-pressed={cardsPerPage === amount}
                      onClick={() => setCardsPerPage(amount)}
                      className={`min-h-14 min-w-0 rounded-xl border px-1 text-sm font-medium transition-colors ${
                        cardsPerPage === amount
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background/70 text-foreground hover:bg-muted"
                      }`}
                    >
                      <span className="block">{label}</span>
                      <span className={`block text-[10px] ${cardsPerPage === amount ? "text-primary-foreground/75" : "text-muted-foreground"}`}>
                        {count} cards
                      </span>
                    </button>
                  ))}
                </div>
              </div>}

              {activeSection === "cards" && <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 flex flex-col gap-4">
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h3 className="text-sm font-semibold">Voice</h3>
                    <p className="text-xs text-muted-foreground">Choose a comfortable speaking pace and volume.</p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">Speaking pace</p>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: "Calm", value: 0.75 },
                      { label: "Natural", value: 1 },
                      { label: "Quick", value: 1.25 },
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        aria-pressed={speechRate === option.value}
                        onClick={() => setSpeechRate(option.value)}
                        className={`h-10 rounded-xl border text-sm font-medium transition-colors ${
                          speechRate === option.value
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-background text-foreground hover:bg-muted"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                <label className="block">
                  <span className="flex items-center justify-between text-xs font-medium text-muted-foreground">
                    <span>Volume</span>
                    <span>{Math.round(speechVolume * 100)}%</span>
                  </span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={speechVolume}
                    onChange={(event) => setSpeechVolume(Number(event.target.value))}
                    className="mt-2 w-full accent-primary"
                  />
                </label>
              </div>}

              {activeSection === "cards" && <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 flex flex-col justify-between gap-3">
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
              </div>}
            </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/70 bg-background px-6 py-4 md:px-8">
            <p className="hidden text-xs text-muted-foreground sm:block">
              {activeSection === "profile"
                ? "Save after changing the learner profile."
                : "Changes in this section save automatically."}
            </p>
            <div className="ml-auto flex items-center gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
              {activeSection === "profile" && (
                <Button type="button" onClick={handleSave} disabled={!hasChanges}>
                  <Save className="mr-2 h-4 w-4" />
                  Save profile
                </Button>
              )}
            </div>
          </div>
        </div>

        <AddCardModal open={showAddCard} onClose={() => setShowAddCard(false)} />
      </div>
    </>
  );
};
