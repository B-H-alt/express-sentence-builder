import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Clock3,
  KeyRound,
  LockKeyhole,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Trash2,
  TrendingUp,
  Type,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useCardStore } from "@/store/cardStore";

const PIN_STORAGE_KEY = "expressly-parent-pin-v1";
const AUTO_LOCK_MS = 5 * 60 * 1000;

type StoredPin = { salt: string; hash: string };

const bytesToBase64 = (bytes: Uint8Array) =>
  btoa(String.fromCharCode(...bytes));

const hashPin = async (pin: string, salt: string) => {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bytesToBase64(new Uint8Array(digest));
};

const readStoredPin = (): StoredPin | null => {
  try {
    const parsed = JSON.parse(localStorage.getItem(PIN_STORAGE_KEY) ?? "null") as StoredPin | null;
    return parsed?.salt && parsed?.hash ? parsed : null;
  } catch {
    return null;
  }
};

const formatActivityDate = (value: string) => {
  const date = new Date(value);
  const today = new Date();
  return new Intl.DateTimeFormat(undefined, {
    ...(date.toDateString() === today.toDateString() ? {} : { month: "short", day: "numeric" }),
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

const percentChange = (current: number, previous: number) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const ParentDashboard = () => {
  const navigate = useNavigate();
  const entries = useCardStore((state) => state.progressEntries);
  const clearProgress = useCardStore((state) => state.clearProgress);
  const savedName = useCardStore((state) => state.userName?.trim() || "");
  const userName = !savedName || savedName.toLocaleLowerCase() === "me" ? "Your learner" : savedName;
  const [storedPin, setStoredPin] = useState<StoredPin | null>(() => readStoredPin());
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  const lockTimer = useRef<number | undefined>();

  const lockDashboard = useCallback(() => {
    setPin("");
    setConfirmPin("");
    setError("");
    setUnlocked(false);
  }, []);

  useEffect(() => {
    if (!unlocked) return;
    const resetTimer = () => {
      if (lockTimer.current) window.clearTimeout(lockTimer.current);
      lockTimer.current = window.setTimeout(() => {
        lockDashboard();
      }, AUTO_LOCK_MS);
    };
    const events = ["pointerdown", "keydown", "scroll"] as const;
    events.forEach((event) => window.addEventListener(event, resetTimer, { passive: true }));
    resetTimer();
    return () => {
      if (lockTimer.current) window.clearTimeout(lockTimer.current);
      events.forEach((event) => window.removeEventListener(event, resetTimer));
    };
  }, [lockDashboard, unlocked]);

  const handlePin = async (event: FormEvent) => {
    event.preventDefault();
    if (!/^\d{4,6}$/.test(pin)) {
      setError("Use a 4–6 digit PIN.");
      return;
    }
    if (!storedPin && pin !== confirmPin) {
      setError("The PINs do not match.");
      return;
    }

    setBusy(true);
    setError("");
    if (!storedPin) {
      const salt = bytesToBase64(crypto.getRandomValues(new Uint8Array(16)));
      const next = { salt, hash: await hashPin(pin, salt) };
      localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(next));
      setStoredPin(next);
      setUnlocked(true);
      setPin("");
      setConfirmPin("");
      setBusy(false);
      return;
    }

    const candidate = await hashPin(pin, storedPin.salt);
    if (candidate !== storedPin.hash) {
      setError("That PIN is incorrect.");
      setBusy(false);
      return;
    }
    setUnlocked(true);
    setPin("");
    setBusy(false);
  };

  const insights = useMemo(() => {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;
    const thisWeekEntries = entries.filter((entry) => new Date(entry.completedAt).getTime() >= now - 7 * day);
    const previousWeekEntries = entries.filter((entry) => {
      const time = new Date(entry.completedAt).getTime();
      return time >= now - 14 * day && time < now - 7 * day;
    });
    const average = (items: typeof entries) =>
      items.length ? items.reduce((sum, entry) => sum + entry.wordCount, 0) / items.length : 0;

    const phraseCounts = new Map<string, { label: string; count: number }>();
    const previousWords = new Set(
      entries
        .filter((entry) => new Date(entry.completedAt).getTime() < now - 7 * day)
        .flatMap((entry) => entry.cardLabels.map((label) => label.toLocaleLowerCase()))
    );
    const newWords = new Set<string>();
    entries.forEach((entry) => {
      entry.cardLabels.forEach((label) => {
        const key = label.toLocaleLowerCase();
        const current = phraseCounts.get(key);
        phraseCounts.set(key, { label, count: (current?.count ?? 0) + 1 });
        if (new Date(entry.completedAt).getTime() >= now - 7 * day && !previousWords.has(key)) newWords.add(label);
      });
    });

    const daily = Array.from({ length: 7 }, (_, index) => {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      start.setDate(start.getDate() - (6 - index));
      const end = start.getTime() + day;
      return {
        label: new Intl.DateTimeFormat(undefined, { weekday: "narrow" }).format(start),
        count: entries.filter((entry) => {
          const time = new Date(entry.completedAt).getTime();
          return time >= start.getTime() && time < end;
        }).length,
      };
    });

    return {
      totalWords: entries.reduce((sum, entry) => sum + entry.wordCount, 0),
      uniqueWords: phraseCounts.size,
      thisWeek: thisWeekEntries.length,
      previousWeek: previousWeekEntries.length,
      averageLength: average(entries),
      thisWeekAverage: average(thisWeekEntries),
      previousWeekAverage: average(previousWeekEntries),
      newWords: Array.from(newWords).slice(0, 8),
      topPhrases: Array.from(phraseCounts.values())
        .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
        .slice(0, 5),
      daily,
    };
  }, [entries]);

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
            <h1 className="mt-5 text-2xl font-semibold">Parent Mode</h1>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {storedPin
                ? "Enter the parent PIN to view progress and settings."
                : "Create a parent PIN so the learner cannot open progress and settings by accident."}
            </p>
            <form className="mt-6 space-y-4" onSubmit={handlePin}>
              <PinField label={storedPin ? "Parent PIN" : "Create PIN"} value={pin} onChange={setPin} />
              {!storedPin && <PinField label="Confirm PIN" value={confirmPin} onChange={setConfirmPin} />}
              {error && <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>}
              <Button className="w-full" type="submit" disabled={busy}>
                <KeyRound className="mr-2 h-4 w-4" />
                {busy ? "Checking…" : storedPin ? "Open Parent Mode" : "Save PIN and continue"}
              </Button>
            </form>
            <p className="mt-5 text-xs leading-5 text-muted-foreground">
              The PIN is stored as a protected hash on this device. Parent Mode locks again after five minutes, when you leave, or when the page reloads.
            </p>
          </section>
        </div>
      </main>
    );
  }

  const sentenceChange = percentChange(insights.thisWeek, insights.previousWeek);
  const averageDifference = insights.thisWeekAverage - insights.previousWeekAverage;
  const summary = entries.length < 2
    ? `${userName}'s activity will become more useful after a few saved sentences.`
    : `${userName} made ${insights.thisWeek} ${insights.thisWeek === 1 ? "sentence" : "sentences"} this week. ${insights.previousWeek > 0 ? `That is ${Math.abs(sentenceChange)}% ${sentenceChange >= 0 ? "more" : "fewer"} than the previous week.` : "This is the first week with enough recent activity to begin a comparison."} ${averageDifference > 0.15 ? `Average sentence length increased by ${averageDifference.toFixed(1)} words.` : averageDifference < -0.15 ? `Average sentence length decreased by ${Math.abs(averageDifference).toFixed(1)} words.` : "Average sentence length is steady."}`;

  const maximumDaily = Math.max(1, ...insights.daily.map((day) => day.count));
  const largestPhraseCount = insights.topPhrases[0]?.count ?? 1;

  return (
    <main className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b border-border/70 bg-background/95 px-4 py-3 backdrop-blur sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Parent Mode</p>
            <h1 className="text-xl font-semibold sm:text-2xl">{userName}&apos;s progress</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={lockDashboard}>
              <LockKeyhole className="mr-2 h-4 w-4" />
              Lock
            </Button>
            <Button onClick={() => navigate("/pecs-app")}>
              Learner mode
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
        <section className="rounded-2xl border border-secondary/20 bg-secondary/5 p-5 sm:p-6">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-1 h-5 w-5 shrink-0 text-secondary" />
            <div>
              <p className="leading-7">{summary}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                This reflects saved Expressly sentences only. It is not an assessment or diagnosis.
              </p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Metric label="Sentences this week" value={insights.thisWeek} icon={MessageSquareText} />
          <Metric label="Average sentence length" value={insights.averageLength ? insights.averageLength.toFixed(1) : "0"} icon={BarChart3} />
          <Metric label="Different words used" value={insights.uniqueWords} icon={Type} />
          <Metric label="New words this week" value={insights.newWords.length} icon={TrendingUp} />
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-secondary" />
              <h2 className="font-semibold">Last 7 days</h2>
            </div>
            <div className="mt-6 grid h-40 grid-cols-7 items-end gap-2">
              {insights.daily.map((day, index) => (
                <div key={`${day.label}-${index}`} className="flex h-full flex-col items-center justify-end gap-2">
                  <span className="text-xs font-medium text-muted-foreground">{day.count || ""}</span>
                  <div className="w-full rounded-t-lg bg-secondary/80" style={{ height: `${Math.max(day.count ? 12 : 3, (day.count / maximumDaily) * 100)}%` }} />
                  <span className="text-xs text-muted-foreground">{day.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="font-semibold">Words used most</h2>
            {insights.topPhrases.length ? (
              <div className="mt-5 space-y-4">
                {insights.topPhrases.map((phrase) => (
                  <div key={phrase.label}>
                    <div className="mb-1.5 flex justify-between gap-3 text-sm">
                      <span className="truncate font-medium">{phrase.label}</span>
                      <span className="text-muted-foreground">{phrase.count}×</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-secondary" style={{ width: `${Math.max(12, (phrase.count / largestPhraseCount) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            ) : <EmptyState>Frequently used words will appear after sentences are saved.</EmptyState>}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="font-semibold">New words this week</h2>
            {insights.newWords.length ? (
              <div className="mt-4 flex flex-wrap gap-2">
                {insights.newWords.map((word) => <span key={word} className="rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">{word}</span>)}
              </div>
            ) : <EmptyState>New vocabulary will appear here as it is used.</EmptyState>}
          </div>
          <div className="rounded-2xl border border-border bg-card p-5 sm:p-6">
            <h2 className="font-semibold">Recent sentences</h2>
            {entries.length ? (
              <div className="mt-4 divide-y divide-border">
                {entries.slice(0, 6).map((entry) => (
                  <div key={entry.id} className="py-3 first:pt-0 last:pb-0">
                    <p className="font-medium leading-6">{entry.sentenceText}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{entry.wordCount} {entry.wordCount === 1 ? "word" : "words"} · {formatActivityDate(entry.completedAt)}</p>
                  </div>
                ))}
              </div>
            ) : <EmptyState>Tap Done after building a sentence to save it here.</EmptyState>}
          </div>
        </section>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border py-4">
          {entries.length > 0 && (isConfirmingClear ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-muted-foreground">Clear all saved activity?</span>
              <Button size="sm" variant="ghost" onClick={() => setIsConfirmingClear(false)}>Keep it</Button>
              <Button size="sm" variant="destructive" onClick={() => { clearProgress(); setIsConfirmingClear(false); }}>Clear</Button>
            </div>
          ) : (
            <Button size="sm" variant="ghost" className="text-muted-foreground" onClick={() => setIsConfirmingClear(true)}>
              <Trash2 className="mr-2 h-4 w-4" />
              Clear activity
            </Button>
          ))}
          <p className="ml-auto text-xs text-muted-foreground">Progress is still stored on this device until account sync is added.</p>
        </footer>
      </div>
    </main>
  );
};

const PinField = ({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium">{label}</label>
    <div className="relative">
      <LockKeyhole className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        type="password"
        inputMode="numeric"
        autoComplete="one-time-code"
        pattern="[0-9]{4,6}"
        maxLength={6}
        required
        value={value}
        onChange={(event) => onChange(event.target.value.replace(/\D/g, ""))}
        className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-lg tracking-[0.35em] outline-none focus:ring-2 focus:ring-ring"
      />
    </div>
  </div>
);

const Metric = ({ label, value, icon: Icon }: { label: string; value: string | number; icon: typeof BarChart3 }) => (
  <div className="rounded-2xl border border-border bg-card p-4 sm:p-5">
    <Icon className="h-4 w-4 text-secondary" />
    <p className="mt-4 text-2xl font-semibold tracking-tight sm:text-3xl">{value}</p>
    <p className="mt-1 text-sm text-muted-foreground">{label}</p>
  </div>
);

const EmptyState = ({ children }: { children: string }) => (
  <p className="mt-4 text-sm leading-6 text-muted-foreground">{children}</p>
);
