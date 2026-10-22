import { useMemo, useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCardStore } from "@/store/cardStore";

const categories = [
  ["people", "People"], ["body", "Body"], ["feelings", "Feelings"],
  ["actions", "Actions"], ["responses", "Responses"], ["activities", "Activities"],
  ["objects", "Objects"], ["places", "Places"], ["social", "Social"],
  ["food", "Food"], ["descriptive", "Describing"], ["time", "Time"],
  ["animals", "Animals"], ["nature", "Nature"], ["sports", "Sports"],
];

export function ActivityDashboard({ name, onBack, onBoard, onLock, hasPin }: {
  name: string; onBack: () => void; onBoard: () => void; onLock: () => void; hasPin: boolean;
}) {
  const entries = useCardStore(s => s.progressEntries);
  const hidden = useCardStore(s => s.hiddenCategories);
  const toggleCategory = useCardStore(s => s.toggleCategoryVisibility);
  const clear = useCardStore(s => s.clearProgress);
  const [days, setDays] = useState(7);
  const [history, setHistory] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [notice, setNotice] = useState("");
  const data = useMemo(() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - days + 1);
    const selected = entries.filter(e => {
      const time = new Date(e.completedAt).getTime();
      return time >= start.getTime() && time <= now.getTime();
    }).sort((a, b) => Date.parse(b.completedAt) - Date.parse(a.completedAt));
    const counts = new Map<string, { label: string; count: number }>();
    selected.forEach(e => e.cardLabels.forEach(label => {
      const key = label.trim().toLocaleLowerCase();
      if (!key) return;
      const previous = counts.get(key);
      counts.set(key, { label: label.trim(), count: (previous?.count ?? 0) + 1 });
    }));
    const daily = Array.from({ length: days }, (_, index) => {
      const date = new Date(start);
      date.setDate(date.getDate() + index);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      return { date, count: selected.filter(e => {
        const time = Date.parse(e.completedAt);
        return time >= date.getTime() && time < end.getTime();
      }).length };
    });
    return { selected, daily, unique: counts.size, active: daily.filter(d => d.count > 0).length,
      top: [...counts.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label)).slice(0, 6),
      range: `${start.toLocaleDateString(undefined, { month: "short", day: "numeric" })} – ${now.toLocaleDateString(undefined, { month: "short", day: "numeric" })}` };
  }, [entries, days]);
  const maximum = Math.max(1, ...data.daily.map(d => d.count));
  return <main className="app-safe-top app-safe-bottom min-h-[100dvh] bg-muted/25">
    <header className="sticky top-0 z-20 border-b border-border/60 bg-background px-4 py-3 sm:px-8">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
        <Button variant="outline" onClick={onBack}><ArrowLeft aria-hidden="true" className="mr-2 h-4 w-4" />Caregiver area</Button>
        <div className="flex gap-2"><Button variant="outline" onClick={onLock}>{hasPin ? "Lock" : "Add a PIN"}</Button><Button onClick={onBoard}>Return to board</Button></div>
      </div>
    </header>
    <div className="mx-auto max-w-6xl space-y-7 px-4 py-8 sm:px-8 sm:py-12">
      <section className="flex flex-wrap items-end justify-between gap-5">
        <div><p className="text-sm text-muted-foreground">{name} · This device</p><h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">Activity overview</h1><p className="mt-3 text-sm text-muted-foreground">Recorded messages, not a measure of communication ability.</p></div>
        <div><label htmlFor="activity-range" className="mb-2 block text-sm font-medium">Date range</label><select id="activity-range" value={days} onChange={e => { setDays(Number(e.target.value)); setHistory(false); }} className="min-h-11 rounded-xl border border-border bg-background px-4 text-sm"><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option></select></div>
      </section>
      <section aria-label="Activity totals" className="grid gap-0 overflow-hidden rounded-2xl border border-border/60 bg-card sm:grid-cols-3">
        {[ ["Recorded messages", data.selected.length], ["Recorded words", data.selected.reduce((total, entry) => total + entry.wordCount, 0)], ["Days with recorded activity", data.active] ].map(([label, value]) => <div key={label} className="px-6 py-6 [&+div]:border-t [&+div]:border-border/60 sm:[&+div]:border-l sm:[&+div]:border-t-0"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-3 text-4xl font-medium tracking-tight">{value}</p></div>)}
      </section>
      {!data.selected.length && <section className="rounded-2xl border border-dashed border-border bg-background px-6 py-8"><h2 className="text-lg font-medium">No recorded activity in this range</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Completed sentences and quick phrases appear here. An empty history does not mean someone has not communicated.</p><Button variant="outline" className="mt-4" onClick={onBoard}>Open the board</Button></section>}
      <div className="grid items-start gap-6 lg:grid-cols-[1.35fr_1fr]">
        <section className="rounded-2xl border border-border/60 bg-card p-6" aria-labelledby="daily-activity-heading">
          <h2 id="daily-activity-heading" className="text-lg font-medium">Recorded messages by day</h2><p className="mt-1 text-sm text-muted-foreground">{data.range}</p>
          <div className="mt-7 flex h-44 items-end gap-1 sm:gap-2" role="img" aria-label={data.daily.map(d => `${d.date.toLocaleDateString()}: ${d.count} messages`).join("; ")}>
            {data.daily.map((d, index) => <div key={d.date.toISOString()} className="flex h-full min-w-0 flex-1 flex-col justify-end gap-2 text-center" title={`${d.date.toLocaleDateString()}: ${d.count} messages`}>
              {days === 7 && <span className="text-xs tabular-nums text-muted-foreground">{d.count}</span>}
              <div className="flex h-28 items-end"><div className={`w-full rounded-t-md ${d.count ? "bg-primary/80" : "bg-muted"}`} style={{ height: d.count ? `${(d.count / maximum) * 100}%` : "2px" }} /></div>
              <span className="h-4 text-[10px] text-muted-foreground">{days === 7 ? d.date.toLocaleDateString(undefined, { weekday: "short" }) : index % 7 === 0 || index === days - 1 ? d.date.getDate() : ""}</span>
            </div>)}
          </div>
          <details className="mt-5 text-sm"><summary className="min-h-11 cursor-pointer py-3 text-primary">View daily counts</summary><dl className="grid grid-cols-2 gap-x-5 gap-y-2 sm:grid-cols-3">{data.daily.map(d => <div key={d.date.toISOString()} className="flex justify-between gap-2"><dt>{d.date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}</dt><dd className="tabular-nums">{d.count}</dd></div>)}</dl></details>
        </section>
        <section className="rounded-2xl border border-border/60 bg-card p-6"><h2 className="text-lg font-medium">Frequently used cards & phrases</h2><p className="mt-1 text-sm text-muted-foreground">From messages in this page session and selected date range.</p>{data.top.length ? <ol className="mt-5 space-y-4">{data.top.map(item => <li key={item.label}><div className="flex justify-between gap-4 text-sm"><span className="break-words font-medium">{item.label}</span><span className="shrink-0 tabular-nums text-muted-foreground">{item.count} uses</span></div><div className="mt-2 h-1 rounded-full bg-muted"><div className="h-full rounded-full bg-primary/65" style={{ width: `${item.count / data.top[0].count * 100}%` }} /></div></li>)}</ol> : <p className="mt-6 text-sm text-muted-foreground">Card wording is available only for messages from this page session.</p>}</section>
      </div>
      <section className="rounded-2xl border border-border/60 bg-card p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-lg font-medium">Message history</h2><p className="mt-1 text-sm text-muted-foreground">Sentence text is kept only for this page session. Activity counts remain after reopening.</p></div><Button variant="outline" aria-expanded={history} onClick={() => setHistory(!history)}>{history ? "Hide messages" : "Show messages"}</Button></div>{history && <div className="mt-5">{data.selected.length ? <ol className="divide-y divide-border/60">{data.selected.slice(0, 20).map((e, index) => <li key={`${e.id}-${index}`} className="py-4"><p className="break-words leading-6">{e.sentenceText || `${e.wordCount} ${e.wordCount === 1 ? "word" : "words"}. Sentence text was not saved.`}</p><time dateTime={e.completedAt} className="mt-1 block text-xs text-muted-foreground">{new Date(e.completedAt).toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}</time></li>)}</ol> : <p className="text-sm text-muted-foreground">No messages recorded in this range.</p>}</div>}</section>
      <details className="rounded-2xl border border-border/60 bg-card p-6"><summary className="cursor-pointer text-lg font-medium">Board categories</summary><p className="mt-3 text-sm text-muted-foreground">Changes apply immediately to this device. Hidden cards are not deleted.</p><div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">{categories.map(([id, label]) => { const visible = !hidden.includes(id); return <button key={id} type="button" aria-pressed={visible} onClick={() => toggleCategory(id)} className={`flex min-h-12 items-center gap-2 rounded-xl border px-3 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${visible ? "border-primary/25 bg-primary/5" : "border-border text-muted-foreground"}`}>{visible ? <Eye aria-hidden="true" className="h-4 w-4 shrink-0 text-primary" /> : <EyeOff aria-hidden="true" className="h-4 w-4 shrink-0" />}<span>{label}<span className="block text-xs font-normal text-muted-foreground">{visible ? "Shown" : "Hidden"}</span></span></button>; })}</div></details>
      <footer className="space-y-4 pb-6"><p className="text-xs leading-5 text-muted-foreground">Only Expressly’s recorded activity is shown, not every communication or successful audio playback. Activity dates and word counts are stored on this device for up to 500 entries. Sentence text and card order are not saved.</p><details className="text-sm"><summary className="min-h-11 cursor-pointer py-3 text-muted-foreground">Manage activity history</summary><p className="mb-3 text-sm text-muted-foreground">Clear all recorded activity, including entries outside this date range. Cards and saved phrases stay unchanged.</p>{confirmClear ? <div className="flex flex-wrap items-center gap-3"><span>Delete all recorded activity? This cannot be undone.</span><Button variant="outline" onClick={() => setConfirmClear(false)}>Cancel</Button><Button variant="destructive" onClick={() => { clear(); setConfirmClear(false); setHistory(false); setNotice("Activity history cleared."); }}>Delete activity history</Button></div> : <Button variant="outline" disabled={!entries.length} onClick={() => setConfirmClear(true)}>Clear activity history</Button>}</details><p role="status" className="text-sm text-muted-foreground">{notice}</p></footer>
    </div>
  </main>;
}
