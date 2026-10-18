// src/pages/PecsApp.tsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { useNavigate, useSearchParams } from "react-router-dom";
import { SentenceBuilder } from "@/components/pecs/SentenceBuilder";
import { CardGrid } from "@/components/pecs/CardGrid";
import { SavedPhrases } from "@/components/pecs/SavedPhrases";
import { CategoryTabs } from "@/components/pecs/CategoryTabs";
import { AppHeader } from "@/components/pecs/AppHeader";
import { useCardStore } from "@/store/cardStore";
import { ParentAccountDialog } from "@/components/pecs/ParentAccountDialog";
import Onboarding from "@/components/pecs/Onboarding";
import { SpeakNowBar } from "@/components/pecs/SpeakNowBar";
import { AppGuideDialog } from "@/components/pecs/AppGuideDialog";
import { useToast } from "@/hooks/use-toast";
import { CommunicationPreferences } from "@/components/pecs/CommunicationPreferences";
import { RemoteSettingsReceiver } from "@/components/pecs/RemoteSettingsReceiver";
import { ReleaseWelcome } from "@/components/pecs/ReleaseWelcome";
import { hasSeenReleaseWelcome } from "@/lib/releaseWelcome";
import { registerOffline } from "@/lib/registerOffline";
import { CaregiverProtectionContext, useCaregiverProtectionEnabled } from "@/components/pecs/CaregiverProtection";

export interface Card {
  id: string;
  text: string;
  category: string;
  imageUrl?: string;
  image?: string;
  usage: number;
  level?: number;
}

const PecsApp = () => {
  useEffect(() => { registerOffline(); }, []);
  const [selectedCategory, setSelectedCategory] = useState<string>("home");
  const [showGuide, setShowGuide] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const accountRequested = searchParams.get("account") === "sign-in";
  const [showParentAccount, setShowParentAccount] = useState(accountRequested);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (searchParams.get("account") !== "signed-in") return;
    toast({ title: "You're signed in", description: "Welcome to Expressly." });
    const next = new URLSearchParams(searchParams);
    next.delete("account");
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams, toast]);

  const { currentLevel, showWords, setShowWords, lowStimulationMode } = useCardStore(useShallow((state) => ({
    currentLevel: state.currentLevel, showWords: state.showWords, setShowWords: state.setShowWords,
    lowStimulationMode: state.lowStimulationMode,
  })));
  const sentenceLength = useCardStore((state) => showGuide ? state.sentence.length : 0);

  useEffect(() => {
    if (accountRequested) setShowParentAccount(true);
  }, [accountRequested]);

  const handleParentAccountChange = (open: boolean) => {
    setShowParentAccount(open);
    if (!open && accountRequested) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete("account");
      setSearchParams(nextParams, { replace: true });
    }
  };

  const hasCompletedOnboarding = useCardStore((state) => state.onboardingComplete);
  const [releasePending, setReleasePending] = useState(() => !hasSeenReleaseWelcome());

  useEffect(() => {
    if (!hasCompletedOnboarding || releasePending) return;
    if (window.localStorage.getItem("expressly-guide-seen") !== "true") {
      setSearchQuery("");
      setSelectedCategory("actions");
      setShowGuide(true);
    }
  }, [hasCompletedOnboarding, releasePending]);

  const handleGuideChange = (open: boolean) => {
    if (open) {
      setSearchQuery("");
      setSelectedCategory("actions");
    }
    setShowGuide(open);
    if (!open) window.localStorage.setItem("expressly-guide-seen", "true");
  };

  // Measure fixed header height so content starts exactly below it
  const topBarRef = useRef<HTMLDivElement | null>(null);

  // IMPORTANT:
  // Start with a safe non-zero default so first paint never overlaps.
  // This prevents the "top 1.5 rows covered" flash on first transition from onboarding.
  const [topBarH, setTopBarH] = useState(360);

  useLayoutEffect(() => {
    const el = topBarRef.current;
    if (!el) return;

    let raf1 = 0;
    let raf2 = 0;
    let t = 0;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const h = Math.ceil(rect.height);
      if (h > 0) setTopBarH(h);
    };

    // 1) immediate
    update();

    // 2) next frame(s) catches "settling" layout after mount
    raf1 = requestAnimationFrame(() => {
      update();
      raf2 = requestAnimationFrame(update);
    });

    // 3) small delayed pass catches late layout shifts (images, hydration, etc.)
    t = window.setTimeout(update, 60);

    // 4) fonts finishing can change heights after first paint
    const fonts = document.fonts;
    if (fonts?.ready) {
      fonts.ready.then(update).catch(() => {});
    }

    const ro = new ResizeObserver(update);
    ro.observe(el);

    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
      if (t) clearTimeout(t);
    };
  }, []);

  // ✅ SHOW ONBOARDING FIRST
  if (!hasCompletedOnboarding) {
    return (
      <>
        <Onboarding />
        <ParentAccountDialog
          open={showParentAccount}
          onOpenChange={handleParentAccountChange}
        />
      </>
    );
  }

  return (
    <div className={`app-shell relative flex min-h-screen w-full flex-col overflow-x-hidden ${lowStimulationMode ? "bg-background" : "bg-[radial-gradient(160%_100%_at_50%_-10%,hsl(var(--background)/0.06)_0%,transparent_70%),radial-gradient(120%_80%_at_0%_100%,hsl(var(--accent)/0.10)_0%,transparent_70%),radial-gradient(120%_80%_at_100%_100%,hsl(var(--secondary)/0.10)_0%,transparent_70%),linear-gradient(180deg,hsl(var(--background))_0%,hsl(var(--background))_100%)]"}`}>
      <CommunicationPreferences />
      <RemoteSettingsReceiver />
      {/* FIXED STACK */}
      <div
        ref={topBarRef}
        className={[
          "communication-header fixed inset-x-0 top-0 z-50",
          lowStimulationMode ? "bg-background" : "bg-[hsl(var(--background))]/92 backdrop-blur-md",
          "border-b border-border/60",
          lowStimulationMode ? "shadow-none" : "shadow-[0_10px_30px_-18px_rgba(0,0,0,0.55)]",
        ].join(" ")}
      >
        {/* NAV (full width) */}
        <div className="w-full px-0">
          <AppHeader
            showWord={showWords}
            onSetDisplayMode={setShowWords}
            currentLevel={currentLevel}
            onOpenCaregiver={() => navigate("/caregiver")}
          />
        </div>

        {/* Builder + Tabs (contained) */}
        <div className="flex w-full flex-col gap-2 px-3 py-2 sm:px-6 lg:px-8">
          <div className="sentence-header max-h-[280px]">
            <SentenceBuilder showWord={showWords} onOpenGuide={() => handleGuideChange(true)} />
          </div>

          <div className="quick-speech-header"><SpeakNowBar /></div>

          <CategoryTabs
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            currentLevel={currentLevel}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />
        </div>
      </div>

      {/* MAIN CONTENT (starts below fixed stack) */}
      <main className="app-safe-bottom flex-1 pb-8" style={{ paddingTop: topBarH }}>
        <div className="w-full px-3 sm:px-6 lg:px-8">
          <div className="mt-3 sm:mt-4">
            {selectedCategory === "phrases" && !searchQuery.trim() ? <SavedPhrases onHome={() => setSelectedCategory("home")} /> : <CardGrid
              selectedCategory={selectedCategory}
              showWord={showWords}
              onSelectCategory={(category) => {
                setSearchQuery("");
                setSelectedCategory(category);
              }}
              searchQuery={searchQuery}
            />}
          </div>
        </div>
      </main>

      <ParentAccountDialog
        open={showParentAccount}
        onOpenChange={handleParentAccountChange}
      />
      <AppGuideDialog
        open={showGuide}
        sentenceLength={sentenceLength}
        onOpenChange={handleGuideChange}
      />
      <ReleaseWelcome eligible={releasePending && !showParentAccount} onDismiss={() => setReleasePending(false)} />
    </div>
  );
};

const ProtectedPecsApp = () => {
  const enabled = useCaregiverProtectionEnabled();
  return <CaregiverProtectionContext.Provider value={enabled}><PecsApp /></CaregiverProtectionContext.Provider>;
};
export default ProtectedPecsApp;
