import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  KeyRound,
  LockKeyhole,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCardStore } from "@/store/cardStore";
import { pinIsOptional, notifyPinChanged, PIN_STORAGE_KEY, readStoredPin, bytesToBase64, hashPin, type StoredPin } from "@/lib/caregiverPin";
import { SettingsPanel } from "./SettingsPanel";
import { ParentAccountDialog } from "./ParentAccountDialog";
import { FeedbackDialog } from "./FeedbackDialog";
import { SavedPhrases } from "./SavedPhrases";
import { CommunicationPreferences } from "./CommunicationPreferences";
import { CaregiverCards } from "./CaregiverCards";
import { ConnectedDevices } from "./ConnectedDevices";
import { ReleaseWelcome } from "./ReleaseWelcome";
import { CaregiverTour, caregiverTourSeen } from "./CaregiverTour";
import { ActivityDashboard } from "./ActivityDashboard";

export const ParentDashboard = () => <><CommunicationPreferences /><CaregiverPage /></>;

const AUTO_LOCK_MS = 5 * 60 * 1000;



const CaregiverPage = () => {
  const navigate = useNavigate();
  const savedName = useCardStore((state) => state.userName?.trim() || "");
  const profileImage = useCardStore((state) => state.userImage);
  const currentLevel = useCardStore((state) => state.currentLevel);
  const calmMode = useCardStore((state) => state.lowStimulationMode);
  const userName = !savedName || savedName.toLocaleLowerCase() === "me" ? "Your learner" : savedName;
  const [storedPin, setStoredPin] = useState<StoredPin | null>(() => readStoredPin());
  const [unlocked, setUnlocked] = useState(() => pinIsOptional() && !readStoredPin());
  const [section, setSection] = useState<"home" | "progress" | "phrases" | "cards" | "devices">("home");
  const [settings, setSettings] = useState(false);
  const [account, setAccount] = useState(false);
  const [feedback, setFeedback] = useState(false);
  const [releaseWelcome, setReleaseWelcome] = useState(false);
  const [showTour, setShowTour] = useState(() => !caregiverTourSeen());
  const [confirmDisable, setConfirmDisable] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const lockTimer = useRef<number | undefined>();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [section]);

  const lockDashboard = useCallback(() => {
    setPin("");
    setConfirmPin("");
    setError("");
    setUnlocked(false);
    setSettings(false); setAccount(false); setFeedback(false); setReleaseWelcome(false); setSection("home"); setConfirmDisable(false);
  }, []);

  useEffect(() => {
    const refreshProtection = (event: Event) => {
      if (event instanceof StorageEvent && event.key !== null && event.key !== PIN_STORAGE_KEY && event.key !== "expressly-active-account-scope-v1") return;
      setStoredPin(readStoredPin());
      lockDashboard();
    };
    window.addEventListener("storage", refreshProtection);
    window.addEventListener("expressly-pin-changed", refreshProtection);
    return () => {
      window.removeEventListener("storage", refreshProtection);
      window.removeEventListener("expressly-pin-changed", refreshProtection);
    };
  }, [lockDashboard]);

  useEffect(() => {
    if (!unlocked || !storedPin) return;
    const resetTimer = () => {
      if (lockTimer.current) window.clearTimeout(lockTimer.current);
      lockTimer.current = window.setTimeout(() => {
        lockDashboard();
      }, AUTO_LOCK_MS);
    };
    const events = ["pointerdown", "keydown", "scroll"] as const;
    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));
    resetTimer();
    const lockOnBackground = () => { if (document.hidden) lockDashboard(); };
    document.addEventListener("visibilitychange", lockOnBackground);
    return () => {
      if (lockTimer.current) window.clearTimeout(lockTimer.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      document.removeEventListener("visibilitychange", lockOnBackground);
    };
  }, [lockDashboard, unlocked, storedPin]);

  const handlePin = async (event: FormEvent) => {
    event.preventDefault();
    if (!(storedPin ? /^\d{4,6}$/ : /^\d{4}$/).test(pin)) {
      setError(storedPin ? "Enter your existing PIN." : "Use exactly 4 digits (numbers only).");
      return;
    }
    if (!storedPin && pin !== confirmPin) {
      setError("The PINs do not match.");
      return;
    }

    setBusy(true);
    setError("");
    try {
    if (!storedPin) {
      const salt = bytesToBase64(crypto.getRandomValues(new Uint8Array(16)));
      const next: StoredPin = { salt, hash: await hashPin(pin, salt, 2), version: 2 };
      localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(next));
      setStoredPin(next);
      notifyPinChanged();
      setUnlocked(true);
      setPin("");
      setConfirmPin("");
      setBusy(false);
      return;
    }

    const version = storedPin.version === 2 ? 2 : 1;
    const candidate = await hashPin(pin, storedPin.salt, version);
    if (candidate !== storedPin.hash) {
      setError("That PIN is incorrect.");
      setBusy(false);
      return;
    }
    if (version === 1) {
      const upgraded: StoredPin = {
        salt: storedPin.salt,
        hash: await hashPin(pin, storedPin.salt, 2),
        version: 2,
      };
      localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(upgraded));
      setStoredPin(upgraded);
    }
    setUnlocked(true);
    setPin("");
    } catch {
      setError("Your PIN could not be saved or checked. Please try again.");
    } finally {
      setBusy(false);
    }
  };


  if (!unlocked) {
    return (
      <main className="min-h-screen bg-background px-4 py-8 sm:py-12">
        <div className="mx-auto max-w-md">
          <Button variant="ghost" className="mb-6 -ml-3" onClick={() => navigate("/pecs-app")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to learner mode
          </Button>
          <section className="rounded-3xl border border-border/70 bg-card p-6 shadow-xl sm:p-8">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold">Caregiver area</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {storedPin
                ? "Enter your PIN to manage Expressly."
                : "Choose a 4-digit PIN to protect settings."}
            </p>
            <form className="mt-6 space-y-4" onSubmit={handlePin}>
              <PinField label={storedPin ? "Parent PIN" : "Create PIN"} value={pin} onChange={setPin} allowLegacy={Boolean(storedPin)} />
              {!storedPin && <PinField label="Confirm PIN" value={confirmPin} onChange={setConfirmPin} />}
              {error && <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
              <Button className="w-full" type="submit" disabled={busy}>
                <KeyRound className="mr-2 h-4 w-4" />
                {busy ? "Checking…" : storedPin ? "Unlock caregiver area" : "Save PIN and continue"}
              </Button>
            </form>
            {!storedPin && <Button variant="ghost" className="mt-3 w-full" onClick={() => {
              try { localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify({ disabled: true })); notifyPinChanged(); setUnlocked(true); }
              catch { setError("This device could not save that choice."); }
            }}>Continue without a PIN</Button>}
            <p className="mt-5 text-xs leading-5 text-muted-foreground">The PIN prevents accidental changes on this device. It is separate from your account password.</p>
          </section>
        </div>
      </main>
    );
  }

  if (section !== "progress") {
    return <main className="app-safe-top app-safe-bottom min-h-[100dvh] bg-muted/25">
      <header className="sticky top-0 z-20 border-b border-border/50 bg-background px-5 py-4">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          {section === "home" ? <div className="flex items-center gap-3"><span className="text-xl font-bold tracking-tight text-primary">Expressly</span><span className="h-4 w-px bg-border" /><span className="text-sm text-muted-foreground">Caregiver</span></div> : <Button variant="outline" onClick={() => setSection("home")}><ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" />Caregiver area</Button>}
          <div className="flex gap-2 max-sm:w-full max-sm:[&>button]:flex-1">
            <Button variant="outline" onClick={lockDashboard}>{storedPin ? "Lock" : "Add a PIN"}</Button>
            <Button onClick={() => navigate("/pecs-app")}>Return to board</Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-12">
        {section === "phrases" ? <SavedPhrases onHome={() => setSection("home")} showHomeButton={false} /> : section === "cards" ? <CaregiverCards onHome={() => setSection("home")} /> : section === "devices" ? <ConnectedDevices onHome={() => setSection("home")} /> : <>
          <div className="mb-8 sm:mb-10">
            <div className="flex flex-wrap items-center justify-between gap-3"><h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Caregiver area</h1><Button variant="outline" onClick={() => setShowTour(true)}>Quick tour</Button></div>
          </div>
          {showTour && <CaregiverTour onClose={() => setShowTour(false)} />}
          <section aria-label="Current learner" className="mb-9 flex flex-wrap items-center gap-x-6 gap-y-4 rounded-2xl bg-primary/[0.055] px-5 py-5 sm:px-6">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-background text-xl font-medium text-primary">
                {profileImage ? <img src={profileImage} alt="" className="h-full w-full object-cover" /> : (savedName && savedName.toLowerCase() !== "me" ? savedName[0].toUpperCase() : "E")}
              </div>
              <div className="min-w-0"><p className="break-words text-lg font-semibold tracking-tight">{userName}</p><p className="mt-0.5 text-xs text-muted-foreground">This device · not a remote board</p></div>
            </div>
            <dl className="flex flex-wrap gap-x-8 gap-y-3 max-sm:w-full max-sm:pl-[72px]">
              <div><dt className="text-xs text-muted-foreground">Vocabulary</dt><dd className="mt-1 text-sm font-medium">Level {currentLevel}</dd></div>
              <div><dt className="text-xs text-muted-foreground">Calm mode</dt><dd className="mt-1 text-sm font-medium">{calmMode ? "On" : "Off"}</dd></div>
            </dl>
          </section>
          <div className="grid items-start gap-8 lg:grid-cols-[1.25fr_1fr] lg:gap-10">
            <section aria-labelledby="caregiver-board-heading">
              <h2 id="caregiver-board-heading" className="mb-3 text-sm font-semibold">Your board</h2>
              <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
                <CaregiverRow label="Settings" text="Profile, vocabulary, display and voice." onClick={() => setSettings(true)} featured />
                <CaregiverRow label="Manage cards" text="Favorites and custom cards." onClick={() => setSection("cards")} />
                <CaregiverRow label="Saved phrases" text="Everyday messages, ready to use." onClick={() => setSection("phrases")} />
              </div>
            </section>
            <div className="space-y-7">
              <section aria-labelledby="caregiver-activity-heading">
                <h2 id="caregiver-activity-heading" className="mb-3 text-sm font-semibold">Activity & devices</h2>
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
                  <CaregiverRow label="Parent dashboard" text="Saved activity and category visibility." onClick={() => setSection("progress")} />
                  <CaregiverRow label="Connected devices" text="Link a device for remote adjustments." onClick={() => setSection("devices")} />
                </div>
              </section>
              <section aria-labelledby="caregiver-account-heading">
                <h2 id="caregiver-account-heading" className="mb-3 text-sm font-semibold">Account & support</h2>
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-card">
                  <CaregiverRow label="Account" onClick={() => setAccount(true)} />
                  <CaregiverRow label="Send feedback" onClick={() => setFeedback(true)} />
                  <CaregiverRow label="What’s new" onClick={() => setReleaseWelcome(true)} />
                </div>
              </section>
            </div>
          </div>
          <section className="mt-10 border-t border-border/60 pt-6">
            <h2 className="text-sm font-semibold">PIN protection {storedPin ? "on" : "off"}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{storedPin ? "Editing controls are hidden on the board. Locks when you leave or after five idle minutes." : "Use Expressly independently, or add a PIN to protect editing controls."}</p>
            {storedPin && (confirmDisable ? <div className="mt-4 flex flex-wrap items-center gap-3">
              <span className="text-sm">Allow changes without a PIN?</span>
              <Button variant="outline" onClick={() => setConfirmDisable(false)}>Keep PIN</Button>
              <Button variant="destructive" onClick={() => {
                try { localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify({ disabled: true })); setStoredPin(null); setConfirmDisable(false); notifyPinChanged(); setUnlocked(true); }
                catch { setError("PIN protection could not be changed."); }
              }}>Turn off protection</Button>
            </div> : <Button variant="ghost" className="mt-3" onClick={() => setConfirmDisable(true)}>Turn off PIN</Button>)}
            {error && <p role="alert" className="mt-3 text-sm text-destructive">{error}</p>}
          </section>
        </>}
      </div>
      <SettingsPanel open={settings} onClose={() => setSettings(false)} />
      <ParentAccountDialog open={account} onOpenChange={setAccount} />
      <FeedbackDialog open={feedback} onOpenChange={setFeedback} />
      <ReleaseWelcome eligible={releaseWelcome} manual audience="caregiver" onDismiss={() => setReleaseWelcome(false)} />
    </main>;
  }

  return <ActivityDashboard name={userName} onBack={() => setSection("home")} onBoard={() => navigate("/pecs-app")} onLock={lockDashboard} hasPin={Boolean(storedPin)} />;
};

const CaregiverRow = ({ label, text, onClick, featured = false }: { label: string; text?: string; onClick: () => void; featured?: boolean }) => (
  <button type="button" aria-label={label} onClick={onClick} className="group flex min-h-14 w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/40 focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring [&+button]:border-t [&+button]:border-border/50 sm:px-6">
    <span className="min-w-0 flex-1"><span className={`block text-[15px] font-medium tracking-tight ${featured ? "text-primary" : ""}`}>{label}</span>{text && <span className="mt-1 block text-sm leading-5 text-muted-foreground">{text}</span>}</span>
    <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-muted-foreground/60 group-hover:text-foreground" />
  </button>
);
const PinField = ({ label, value, onChange, allowLegacy = false }: { label: string; value: string; onChange: (value: string) => void; allowLegacy?: boolean }) => (
  <div className="space-y-2">
    <label htmlFor={`caregiver-${label.replace(/ /g, "-").toLowerCase()}`} className="text-sm font-medium">{label}</label>
    <div className="relative">
      <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id={`caregiver-${label.replace(/ /g, "-").toLowerCase()}`}
        type="password"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern={allowLegacy ? "[0-9]{4,6}" : "[0-9]{4}"}
        maxLength={allowLegacy ? 6 : 4}
        minLength={4}
        aria-describedby={`caregiver-${label.replace(/ /g, "-").toLowerCase()}-format`}
        required
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
        className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-lg tracking-[0.35em] outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
    <p id={`caregiver-${label.replace(/ /g, "-").toLowerCase()}-format`} className="text-xs text-muted-foreground">{allowLegacy ? "4 digits. Existing 5–6 digit PINs still work." : "4 digits · Numbers only"}</p>
  </div>
);
