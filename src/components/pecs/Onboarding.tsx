// src/components/pecs/Onboarding.tsx
import { useRef, useState } from "react";
import { useCardStore, type CharacterGender } from "@/store/cardStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Upload, UserRound, X } from "lucide-react";

export default function Onboarding() {
  const completeOnboarding = useCardStore((s) => s.completeOnboarding);
  const saveCharacterGender = useCardStore((s) => s.setCharacterGender);

  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [gender, setGender] = useState<CharacterGender>("girl");

  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleContinue = () => {
    saveCharacterGender(gender);
    completeOnboarding(name.trim() || "Me", image ?? undefined);
  };

  const handleSkip = () => {
    saveCharacterGender(gender);
    completeOnboarding("Me", undefined);
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
              Let&apos;s personalize Expressly
            </h2>

            <p className="font-inter font-medium text-lg text-muted-foreground mb-8 leading-relaxed">
              Add a name, choose a card character, and optionally upload
              a photo. You can change these settings later.
            </p>

            <div className="hidden md:flex items-center gap-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-2">
                <UserRound className="h-4 w-4" />
                Name, card character, and optional photo
              </span>
            </div>
          </div>

          <div className="w-full">
            <div className="rounded-2xl bg-white border border-border shadow-xl p-6 md:p-7">
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
                  accept="image/*"
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

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full sm:flex-1"
                    onClick={handleSkip}
                  >
                    Skip for now
                  </Button>
                </div>

                <p className="mt-3 text-xs text-muted-foreground">
                  This stays on your device unless account syncing is added.
                </p>
              </div>

              <Button
                type="button"
                className="w-full bg-secondary text-white hover:bg-secondary/90"
                onClick={handleContinue}
              >
                Continue
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
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