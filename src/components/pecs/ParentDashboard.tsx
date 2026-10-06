import { useEffect, useMemo, useState } from "react";
import { BarChart3, Clock3, MessageSquareText, Trash2, TrendingUp, Type, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCardStore } from "@/store/cardStore";

interface ParentDashboardProps {
  open: boolean;
  onClose: () => void;
}

const formatActivityDate = (value: string) => {
  const date = new Date(value);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();

  return new Intl.DateTimeFormat(undefined, {
    ...(isToday ? {} : { month: "short", day: "numeric" }),
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
};

export const ParentDashboard = ({ open, onClose }: ParentDashboardProps) => {
  const entries = useCardStore((state) => state.progressEntries);
  const clearProgress = useCardStore((state) => state.clearProgress);
  const savedName = useCardStore((state) => state.userName?.trim() || "");
  const userName = !savedName || savedName.toLocaleLowerCase() === "me" ? "Your learner" : savedName;
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

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

  const insights = useMemo(() => {
    const totalWords = entries.reduce((sum, entry) => sum + entry.wordCount, 0);
    const averageLength = entries.length ? totalWords / entries.length : 0;
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const thisWeek = entries.filter(
      (entry) => new Date(entry.completedAt).getTime() >= sevenDaysAgo
    ).length;

    const phraseCounts = new Map<string, { label: string; count: number }>();
    entries.forEach((entry) => {
      entry.cardLabels.forEach((label) => {
        const key = label.toLocaleLowerCase();
        const current = phraseCounts.get(key);
        phraseCounts.set(key, { label, count: (current?.count ?? 0) + 1 });
      });
    });

    const topPhrases = Array.from(phraseCounts.values())
      .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
      .slice(0, 5);

    return {
      totalWords,
      averageLength,
      thisWeek,
      uniquePhrases: phraseCounts.size,
      topPhrases,
    };
  }, [entries]);

  if (!open) return null;

  const summary = (() => {
    if (entries.length === 0) {
      return `Once ${userName} finishes a sentence, their activity will appear here. There is nothing you need to set up.`;
    }
    if (entries.length === 1) {
      return `${userName} completed their first saved sentence with ${entries[0].wordCount} ${entries[0].wordCount === 1 ? "word" : "words"}. As they keep communicating, this page will begin showing useful patterns.`;
    }

    const frequentPhrase = insights.topPhrases[0]?.label;
    const pattern = frequentPhrase
      ? ` “${frequentPhrase}” has been one of their most-used choices so far.`
      : "";
    return `${userName} has completed ${entries.length} sentences using ${insights.uniquePhrases} different words or phrases. Their messages average ${insights.averageLength.toFixed(1)} words.${pattern}`;
  })();

  const metricCards = [
    { label: "Sentences", value: entries.length, icon: MessageSquareText },
    { label: "Words used", value: insights.totalWords, icon: Type },
    { label: "Average length", value: entries.length ? insights.averageLength.toFixed(1) : "0", icon: BarChart3 },
    { label: "Last 7 days", value: insights.thisWeek, icon: Clock3 },
  ];

  const largestPhraseCount = insights.topPhrases[0]?.count ?? 1;

  return (
    <>
      <div className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed inset-0 z-[90] flex items-center justify-center p-4" onClick={onClose}>
        <section
          role="dialog"
          aria-modal="true"
          aria-labelledby="parent-dashboard-title"
          className="flex max-h-[calc(100vh-2rem)] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-border/60 bg-background shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <header className="flex shrink-0 items-center justify-between gap-4 border-b border-border/70 px-6 py-4 md:px-8">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Parent view</p>
              <h2 id="parent-dashboard-title" className="mt-1 text-xl font-semibold md:text-2xl">
                {userName}&apos;s progress
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close parent dashboard"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-border/60 transition-colors hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-6 md:p-8">
            <div className="rounded-2xl border border-secondary/20 bg-secondary/5 p-5 md:p-6">
              <p className="max-w-3xl text-base leading-7 text-foreground">{summary}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                This summary comes directly from saved sentences. It is not an assessment or diagnosis.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {metricCards.map(({ label, value, icon: Icon }) => (
                <div key={label} className="rounded-2xl border border-border bg-card p-4 md:p-5">
                  <Icon className="h-4 w-4 text-secondary" />
                  <p className="mt-4 text-2xl font-semibold tracking-tight md:text-3xl">{value}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-secondary" />
                  <h3 className="font-semibold">Words and phrases used most</h3>
                </div>
                {insights.topPhrases.length > 0 ? (
                  <div className="mt-5 space-y-4">
                    {insights.topPhrases.map((phrase) => (
                      <div key={phrase.label}>
                        <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                          <span className="truncate font-medium">{phrase.label}</span>
                          <span className="text-muted-foreground">{phrase.count}×</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full rounded-full bg-secondary transition-[width] duration-500"
                            style={{ width: `${Math.max(12, (phrase.count / largestPhraseCount) * 100)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-5 text-sm leading-6 text-muted-foreground">
                    Frequently used words and phrases will show here after a sentence is saved.
                  </p>
                )}
              </section>

              <section className="rounded-2xl border border-border bg-card p-5 md:p-6">
                <h3 className="font-semibold">Recent sentences</h3>
                {entries.length > 0 ? (
                  <div className="mt-4 divide-y divide-border">
                    {entries.slice(0, 5).map((entry) => (
                      <div key={entry.id} className="py-3 first:pt-0 last:pb-0">
                        <p className="font-medium leading-6">{entry.sentenceText}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {entry.wordCount} {entry.wordCount === 1 ? "word" : "words"} · {formatActivityDate(entry.completedAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">
                    Tap Done after building a sentence to save it here.
                  </p>
                )}
              </section>
            </div>
          </div>

          <footer className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border/70 px-6 py-4 md:px-8">
            {entries.length > 0 ? (
              isConfirmingClear ? (
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="text-muted-foreground">Clear all saved activity?</span>
                  <Button type="button" size="sm" variant="ghost" onClick={() => setIsConfirmingClear(false)}>
                    Keep it
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      clearProgress();
                      setIsConfirmingClear(false);
                    }}
                  >
                    Clear
                  </Button>
                </div>
              ) : (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="text-muted-foreground"
                  onClick={() => setIsConfirmingClear(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear activity
                </Button>
              )
            ) : (
              <p className="hidden text-xs text-muted-foreground sm:block">Progress stays on this device for now.</p>
            )}
            <Button type="button" variant="outline" className="ml-auto rounded-xl" onClick={onClose}>
              Close
            </Button>
          </footer>
        </section>
      </div>
    </>
  );
};
