// src/components/pecs/SettingsPanel.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useCardStore, vocabularyLevelCounts } from "@/store/cardStore";
import { X, User, Plus, Layers, Save, Leaf, Volume2, Palette, MessagesSquare, Moon, Sun } from "lucide-react";
import { AddCardModal } from "@/components/pecs/AddCardModal";
import { Button } from "@/components/ui/button";
import type { AppLanguage, CardDisplayAmount, CharacterGender, TextSize, VocabularyLevel } from "@/store/cardStore";
import { useTheme } from "next-themes";
import { Slider } from "@/components/ui/slider";
import { languageNames } from "@/lib/language";
import { processImageUpload } from "@/lib/imageUpload";
import { AccessibilitySettings } from "./AccessibilitySettings";
import { ProfilePhotoCropper } from "./ProfilePhotoCropper";
import { UnsavedChangesDialog } from "./UnsavedChangesDialog";
import { BoardBackupSettings } from "./BoardBackupSettings";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

const levelOptions: { level: VocabularyLevel; label: string; subtitle: string }[] = [
  { level: 1, label: "Level 1 (Beginner)", subtitle: `Everyday needs and core words (${vocabularyLevelCounts[1]} built-in cards)` },
  { level: 2, label: "Level 2 (Intermediate)", subtitle: `Daily life and more choices (${vocabularyLevelCounts[2]} built-in cards)` },
  { level: 3, label: "Level 3 (Advanced)", subtitle: `More conversation and daily activities (${vocabularyLevelCounts[3]} built-in cards)` },
  { level: 4, label: "Level 4 (Explore)", subtitle: `Animals, nature and sports (${vocabularyLevelCounts[4]} built-in cards)` },
  { level: 5, label: "Level 5 (More interests)", subtitle: `More animals, outdoors and equipment (${vocabularyLevelCounts[5]} built-in cards)` },
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
  } = useCardStore(useShallow((state) => ({
    currentLevel: state.currentLevel, setLevel: state.setLevel,
    cardsPerPage: state.cardsPerPage, setCardsPerPage: state.setCardsPerPage,
    lowStimulationMode: state.lowStimulationMode, setLowStimulationMode: state.setLowStimulationMode,
    textSize: state.textSize, setTextSize: state.setTextSize,
    speechRate: state.speechRate, setSpeechRate: state.setSpeechRate,
    speechVolume: state.speechVolume, setSpeechVolume: state.setSpeechVolume,
  })));
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
  const language = useCardStore((s) => s.language);
  const setLanguage = useCardStore((s) => s.setLanguage);

  const [showAddCard, setShowAddCard] = useState(false);
  const [activeSection, setActiveSection] = useState<"profile" | "display" | "cards" | "accessibility">("profile");

  const [draftName, setDraftName] = useState("Me");
  const [draftImage, setDraftImage] = useState<string | null>(null);
  const [cropSource, setCropSource] = useState<string | null>(null);
  const [draftGender, setDraftGender] = useState<CharacterGender>("girl");
  const [draftLanguage, setDraftLanguage] = useState<AppLanguage>("en");
  const [draftLevel, setDraftLevel] = useState<VocabularyLevel>(currentLevel);
  const [levelSaved, setLevelSaved] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const hasChanges =
    (draftName.trim() || "Me") !== (userName?.trim() || "Me") ||
    (draftImage ?? null) !== (userImage ?? null) ||
    draftGender !== characterGender || draftLanguage !== language;
  const requestClose = useCallback(() => {
    if (hasChanges || draftLevel !== currentLevel || cropSource) setConfirmClose(true);
    else onClose();
  }, [hasChanges, draftLevel, currentLevel, cropSource, onClose]);

  useEffect(() => {
    setDraftLevel(currentLevel);
  }, [open, currentLevel]);

  useEffect(() => {
    setLevelSaved(false);
    setCropSource(null);
    setConfirmClose(false);
  }, [open]);

  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setActiveSection("profile");
    setDraftName(userName?.trim() || "Me");
    setDraftImage(userImage ?? null);
    setDraftGender(characterGender);
    setDraftLanguage(language);
  }, [open, userName, userImage, characterGender, language]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented && !showAddCard) {
        event.preventDefault();
        if (confirmClose) setConfirmClose(false);
        else requestClose();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, requestClose, confirmClose, showAddCard]);

  if (!open) return null;

  const handlePickImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      setCropSource(await processImageUpload(file));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "That image could not be used.");
    }
  };

  const handleSave = () => {
    updateUserProfile(draftName.trim() || "Me", draftImage);
    setCharacterGender(draftGender);
    setLanguage(draftLanguage);
    if (draftLevel !== currentLevel) setConfirmClose(true);
    else onClose();
  };

  const handleRemovePhoto = () => {
    setDraftImage(null);
    setCropSource(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
        onClick={requestClose}
      />

      <div
        className="fixed inset-x-0 z-[90] flex items-center justify-center p-4"
        style={{ top: "var(--visual-top, 0px)", height: "var(--visual-height, 100dvh)" }}
        onClick={requestClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="settings-title"
          className="relative flex max-h-full w-full max-w-4xl flex-col overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex shrink-0 items-center justify-between gap-4 border-b border-border/70 bg-background px-6 py-4 md:px-8">
            <div className="min-w-0">
              <h2 id="settings-title" className="text-xl font-semibold md:text-2xl">Settings</h2>
            </div>
            <button
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border/60 hover:bg-muted transition-colors"
              onClick={requestClose}
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
              className="mb-6 grid grid-cols-2 gap-1 rounded-2xl border border-border/70 bg-muted/40 p-1.5 sm:grid-cols-4"
            >
              {[
                { id: "profile", label: "Profile", icon: User },
                { id: "display", label: "Display", icon: Palette },
                { id: "cards", label: "Cards & voice", icon: MessagesSquare },
                { id: "accessibility", label: "Accessibility", icon: User },
              ].map((section) => {
                const Icon = section.icon;
                const selected = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => setActiveSection(section.id as typeof activeSection)}
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

            {activeSection === "accessibility" && <div className="mx-auto max-w-2xl"><AccessibilitySettings /></div>}
            <div className={`${activeSection === "accessibility" ? "hidden" : "grid"} gap-6 ${activeSection === "display" ? "md:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]" : "mx-auto max-w-2xl"}`}>
            {/* Left column: Profile / Theme */}
            <div className={`flex flex-col gap-6 ${activeSection === "profile" ? "py-1" : "rounded-2xl border border-border/80 bg-muted/40 p-5"} ${activeSection === "cards" ? "hidden" : ""}`}>
              {/* Profile */}
              {activeSection === "profile" && <div className="flex items-center gap-5 pb-2">
                <div className="h-20 w-20 shrink-0 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
                  {draftImage ? (
                    <img src={draftImage} alt="Profile" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-2xl font-medium text-muted-foreground">{(draftName.trim() || "Me").charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <input
                  ref={fileRef}
                  type="file"
                  aria-label="Choose profile photo"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePickImage}
                  className="hidden"
                />

                <div className="min-w-0 space-y-2">
                  <h3 className="text-sm font-semibold">Profile photo</h3>
                  <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
                    Change photo
                  </Button>
                  {draftImage && <Button type="button" variant="outline" size="sm" onClick={() => setCropSource(draftImage)}>Adjust crop</Button>}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleRemovePhoto}
                    disabled={!draftImage}
                  >
                    Remove
                  </Button>
                </div>
                </div>
              </div>}

              {activeSection === "profile" && cropSource && <ProfilePhotoCropper key={cropSource} source={cropSource}
                onApply={(photo) => { setDraftImage(photo); setCropSource(null); }} onCancel={() => setCropSource(null)} />}

              {/* Username */}
              {activeSection === "profile" && <div className="space-y-2">
                <label htmlFor="learner-profile-name" className="text-sm font-semibold">Name</label>
                <input
                  id="learner-profile-name"
                  autoComplete="nickname"
                  className="h-11 w-full rounded-lg border border-border bg-background px-3 text-base text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                  value={draftName}
                  onChange={(e) => setDraftName(e.target.value)}
                  placeholder="Me"
                />
              </div>}

              {/* Card character */}
              {activeSection === "profile" && <div className="space-y-3">
                <h3 className="text-sm font-semibold">Card character</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(["girl", "boy"] as CharacterGender[]).map((gender) => (
                    <button
                      key={gender}
                      type="button"
                      aria-pressed={draftGender === gender}
                      onClick={() => setDraftGender(gender)}
                      className={`h-11 rounded-lg border text-sm font-medium capitalize transition-colors ${
                        draftGender === gender
                          ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {gender}
                    </button>
                  ))}
                </div>
              </div>}

              {activeSection === "profile" && <div className="space-y-3">
                <h3 className="text-sm font-semibold">Language</h3>
                <div className="grid grid-cols-2 gap-2">
                  {(["en", "es"] as AppLanguage[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      aria-pressed={draftLanguage === option}
                      onClick={() => setDraftLanguage(option)}
                      className={`h-11 rounded-lg border text-sm font-medium transition-colors ${
                        draftLanguage === option
                          ? "border-primary bg-primary/5 text-primary ring-1 ring-primary"
                          : "border-border bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {languageNames[option]}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Card labels and speech.
                </p>
              </div>}

              {activeSection === "profile" && <BoardBackupSettings disabled={hasChanges || draftLevel !== currentLevel || Boolean(cropSource)} onRestored={onClose} />}

              {/* Theme */}
              {activeSection === "display" && <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold">Color theme</h3>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-xl border border-border bg-background/70 p-3">
                  <div>
                    <h4 className="text-sm font-medium">Appearance</h4>
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
                <div className="theme-options grid auto-rows-fr grid-cols-2 gap-2 sm:grid-cols-3">
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
                    Blue
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
                          Fewer cards and effects. Hides card editing controls.
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
                  Choose a level, then save.
                </p>

                <div className="space-y-1.5">
                  {levelOptions.map((opt) => (
                    <button
                      key={opt.level}
                      type="button"
                      aria-pressed={draftLevel === opt.level}
                      onClick={() => { setDraftLevel(opt.level); setLevelSaved(false); }}
                      className={`w-full text-left rounded-xl px-3 py-2 text-sm flex items-start gap-2 border transition-colors ${
                        draftLevel === opt.level
                          ? "border-primary/70 bg-primary/5"
                          : "border-border hover:bg-muted/60"
                      }`}
                    >
                      <span className="mt-[2px] text-xs">
                        {draftLevel === opt.level ? "✓" : "○"}
                      </span>
                      <span>
                        <span className={`font-medium ${draftLevel === opt.level ? "text-primary" : ""}`}>
                          {opt.label}
                        </span>
                        <span className="block text-[11px] text-muted-foreground">
                          {opt.subtitle}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                  <p role="status" className="text-xs text-muted-foreground">
                    {draftLevel !== currentLevel
                      ? `Current: Level ${currentLevel}. Change not saved.`
                      : levelSaved ? `Level ${currentLevel} saved.` : `Current: Level ${currentLevel}`}
                  </p>
                  <div className="flex items-center gap-2">
                    {draftLevel !== currentLevel && <Button type="button" variant="ghost" size="sm"
                      onClick={() => { setDraftLevel(currentLevel); setLevelSaved(false); }}>Cancel</Button>}
                    <Button type="button" size="sm" disabled={draftLevel === currentLevel}
                      onClick={() => { setLevel(draftLevel); setLevelSaved(true); }}>
                      Save level
                    </Button>
                  </div>
                </div>
              </div>}

              {activeSection === "display" && <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 flex flex-col gap-3">
                <div>
                  <h3 className="text-sm font-semibold">Card size</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Larger cards show fewer at once.
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
                  <Slider
                    aria-label="Volume"
                    min={0}
                    max={1}
                    step={0.01}
                    value={[speechVolume]}
                    onValueChange={([volume]) => setSpeechVolume(volume)}
                    className="mt-2"
                  />
                </label>
              </div>}

              {activeSection === "cards" && <div className="rounded-2xl border border-border/80 bg-muted/30 p-4 flex flex-col justify-between gap-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h3 className="text-sm font-semibold">Add a custom card</h3>
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
                    Add a card
                  </span>
                </button>
              </div>}
            </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-border/70 bg-background px-6 py-4 md:px-8">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="hidden sm:inline">{activeSection === "profile" ? "Save to apply changes." : activeSection === "display" ? "Save level separately. Other changes auto-save." : "Changes auto-save."}</span>
              <a href="/privacy" target="_blank" rel="noreferrer" className="hover:text-foreground hover:underline">Privacy</a>
              <a href="/terms" target="_blank" rel="noreferrer" className="hover:text-foreground hover:underline">Terms</a>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Button type="button" variant="outline" onClick={requestClose}>
                Close
              </Button>
              {activeSection === "profile" && (
                <Button type="button" onClick={handleSave} disabled={!hasChanges || Boolean(cropSource)}>
                  <Save className="mr-2 h-4 w-4" />
                  Save profile
                </Button>
              )}
            </div>
          </div>
        </div>

        <AddCardModal open={showAddCard} onClose={() => setShowAddCard(false)} />
        <UnsavedChangesDialog open={confirmClose} onKeepEditing={() => setConfirmClose(false)}
          onDiscard={() => { setConfirmClose(false); onClose(); }} canSave={!cropSource}
          description={cropSource ? "Finish or cancel your photo crop first, then save your profile. You can also leave without saving your edits." : "Your profile or level changes have not been saved. Save them now, or discard those edits."}
          onSave={() => {
            if (cropSource) return;
            if (hasChanges) { updateUserProfile(draftName.trim() || "Me", draftImage); setCharacterGender(draftGender); setLanguage(draftLanguage); }
            if (draftLevel !== currentLevel) setLevel(draftLevel);
            setConfirmClose(false); onClose();
          }} />
      </div>
    </>
  );
};
