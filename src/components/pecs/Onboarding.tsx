// src/components/pecs/Onboarding.tsx
import { useRef, useState } from "react";
import { useCardStore, type AppLanguage, type CharacterGender } from "@/store/cardStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, Leaf, Upload, UserRound, X } from "lucide-react";
import { useTheme } from "next-themes";
import { languageNames } from "@/lib/language";
import { processImageUpload } from "@/lib/imageUpload";

type OnboardingPalette = "blue" | "warm" | "sage";

export default function Onboarding() {
  const completeOnboarding = useCardStore((s) => s.completeOnboarding);
  const saveCharacterGender = useCardStore((s) => s.setCharacterGender);
  const saveShowWords = useCardStore((s) => s.setShowWords);
  const saveCalmMode = useCardStore((s) => s.setLowStimulationMode);
  const saveLanguage = useCardStore((s) => s.setLanguage);
  const { setTheme } = useTheme();

  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [gender, setGender] = useState<CharacterGender>("girl");
  const [step, setStep] = useState<"profile" | "preferences">("profile");
  const [palette, setPalette] = useState<OnboardingPalette>("blue");
  const [showWords, setShowWords] = useState(true);
  const [calmMode, setCalmMode] = useState(false);
  const [language, setLanguage] = useState<AppLanguage>("en");

  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setImage(await processImageUpload(file));
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "That image could not be used.");
    }
  };

  const finishOnboarding = () => {
    saveCharacterGender(gender);
    saveShowWords(showWords);
    saveCalmMode(calmMode);
    saveLanguage(language);
    setTheme(palette);
    completeOnboarding(name.trim() || "Me", image ?? undefined);
  };

  const handleSkip = () => {
    saveCharacterGender(gender);
    saveLanguage(language);
    completeOnboarding(name.trim() || "Me", image ?? undefined);
  };

  const clearImage = () => {
    setImage(null);

    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  return (
    <section className="min-h-screen bg-gray-50 flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-5xl">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge className="mb-4 bg-secondary font-semibold text-white hover:bg-secondary/90">
              Innovation in Communication
            </Badge>

            <h2 className="font-inter font-bold text-3xl md:text-4xl mb-4 text-foreground">
              {step === "profile" ? "Let’s personalize Expressly" : "Make Expressly comfortable"}
            </h2>

            <p className="font-inter font-medium text-lg text-muted-foreground mb-8 leading-relaxed">
              {step === "profile"
                ? "Add a name, choose a card character, and optionally upload a photo."
                : "Choose a comfortable starting view. This only takes a moment."}
            </p>

            <div className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                {step === "profile"
                  ? "Name, card character, and optional photo"
                  : "Color, card labels, and Calm Mode"}
              </span>
            </div>
          </div>

          <div className="w-full">
            <div className="rounded-2xl bg-white border border-border shadow-xl p-6 md:p-7">
              <div className="mb-5 flex items-center justify-between gap-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Step {step === "profile" ? "1" : "2"} of 2
                </p>
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="h-1.5 w-8 rounded-full bg-secondary" />
                  <span className={`h-1.5 w-8 rounded-full ${step === "preferences" ? "bg-secondary" : "bg-muted"}`} />
                </div>
              </div>

              {step === "profile" ? <>
              <div className="mb-5">
                <label className="mb-2 block text-sm font-inter font-semibold text-foreground">
                  Language
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {(["en", "es"] as AppLanguage[]).map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => setLanguage(option)}
                      aria-pressed={language === option}
                      className={`h-11 rounded-xl border text-sm font-inter font-semibold transition-colors ${
                        language === option
                          ? "border-secondary bg-secondary text-white"
                          : "border-border bg-white text-foreground hover:bg-muted"
                      }`}
                    >
                      {languageNames[option]}
                    </button>
                  ))}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  This changes card words and spoken sentences. You can change it later in Settings.
                </p>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <div className="relative h-16 w-16 rounded-2xl overflow-hidden bg-gray-100 border border-border flex items-center justify-center">
                  {image ? (
                    <img
                      src={image}
                      alt="Profile preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserRound className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>

                <div className="flex-1">
                  <p className="font-inter font-semibold text-foreground">
                    Learner profile
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Enter a name and choose the card character.
                  </p>
                </div>

                {image && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={clearImage}
                    aria-label="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-sm font-inter font-semibold text-foreground mb-2">
                  Name
                </label>

                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="What should we call you?"
                  className="w-full h-11 rounded-xl border border-border bg-white px-3 text-sm font-inter focus:outline-none focus:ring-2 focus:ring-secondary/30"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-inter font-semibold text-foreground mb-2">
                  Card character
                </label>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setGender("girl")}
                    aria-pressed={gender === "girl"}
                    className={`h-11 rounded-xl border text-sm font-inter font-semibold transition-colors ${
                      gender === "girl"
                        ? "border-secondary bg-secondary text-white"
                        : "border-border bg-white text-foreground hover:bg-muted"
                    }`}
                  >
                    Girl
                  </button>

                  <button
                    type="button"
                    onClick={() => setGender("boy")}
                    aria-pressed={gender === "boy"}
                    className={`h-11 rounded-xl border text-sm font-inter font-semibold transition-colors ${
                      gender === "boy"
                        ? "border-secondary bg-secondary text-white"
                        : "border-border bg-white text-foreground hover:bg-muted"
                    }`}
                  >
                    Boy
                  </button>
                </div>

                <p className="mt-2 text-xs text-muted-foreground">
                  Choose which character appears on applicable communication
                  cards.
                </p>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-inter font-semibold text-foreground mb-2">
                  Profile picture
                </label>

                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageUpload}
                  className="hidden"
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-full sm:w-auto"
                    onClick={() => fileRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload picture
                  </Button>

                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  This stays on your device unless account syncing is added.
                </p>
              </div>

              <Button
                type="button"
                className="w-full bg-secondary text-white hover:bg-secondary/90"
                onClick={() => setStep("preferences")}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
              <button
                type="button"
                onClick={handleSkip}
                className="mt-3 w-full text-center text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Skip personalization
              </button>
              </> : <>
                <div className="space-y-5">
                  <div>
                    <p className="mb-2 text-sm font-semibold text-foreground">Color theme</p>
                    <div className="grid grid-cols-3 gap-2">
                      {([
                        { value: "blue", label: "Blue", colors: ["#17358a", "#19b9c3", "#f4f7fb"] },
                        { value: "warm", label: "Warm", colors: ["#8b4d2b", "#4e7e6b", "#f5ead4"] },
                        { value: "sage", label: "Sage", colors: ["#496b51", "#b28b59", "#eef3eb"] },
                      ] as const).map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          aria-pressed={palette === option.value}
                          onClick={() => setPalette(option.value)}
                          className={`flex min-h-16 flex-col items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-colors ${
                            palette === option.value
                              ? "border-secondary bg-secondary/10 text-foreground"
                              : "border-border bg-white text-foreground hover:bg-muted"
                          }`}
                        >
                          <span className="flex gap-1" aria-hidden="true">
                            {option.colors.map((color) => (
                              <span key={color} className="h-4 w-4 rounded-full ring-1 ring-black/10" style={{ backgroundColor: color }} />
                            ))}
                          </span>
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold text-foreground">Cards start with</p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        aria-pressed={showWords}
                        onClick={() => setShowWords(true)}
                        className={`h-11 rounded-xl border text-sm font-semibold transition-colors ${showWords ? "border-secondary bg-secondary text-white" : "border-border bg-white hover:bg-muted"}`}
                      >
                        Pictures + words
                      </button>
                      <button
                        type="button"
                        aria-pressed={!showWords}
                        onClick={() => setShowWords(false)}
                        className={`h-11 rounded-xl border text-sm font-semibold transition-colors ${!showWords ? "border-secondary bg-secondary text-white" : "border-border bg-white hover:bg-muted"}`}
                      >
                        Pictures only
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 p-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <Leaf className="mt-0.5 h-5 w-5 shrink-0 text-secondary" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">Calm Mode</p>
                        <p className="mt-0.5 text-xs leading-5 text-muted-foreground">Less movement, softer effects, and fewer cards at once.</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-label="Calm Mode"
                      aria-checked={calmMode}
                      onClick={() => setCalmMode((enabled) => !enabled)}
                      className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondary/40 ${calmMode ? "border-secondary bg-secondary" : "border-border bg-gray-200"}`}
                    >
                      <span className={`absolute left-1 top-1 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${calmMode ? "translate-x-5" : "translate-x-0"}`} />
                    </button>
                  </div>
                </div>

                <p className="my-5 text-center text-sm text-muted-foreground">
                  You can always change this later in Settings.
                </p>

                <div className="flex gap-3">
                  <Button type="button" variant="outline" size="icon" onClick={() => setStep("profile")} aria-label="Back">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button type="button" className="flex-1 bg-secondary text-white hover:bg-secondary/90" onClick={finishOnboarding}>
                    Start using Expressly
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </>}
            </div>

            <p className="mt-4 text-center text-xs text-muted-foreground md:hidden">
              You can change these settings later.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
