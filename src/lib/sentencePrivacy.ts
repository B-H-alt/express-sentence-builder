// Only aggregate activity survives a page session. Never persist message wording or order.
type Activity = { id: string; completedAt: string; wordCount: number };
export const activityCountsOnly = <T extends Activity>(entries: T[]) => entries.map(({ id, completedAt, wordCount }) => ({
  id, completedAt, wordCount, cardLabels: [] as string[], sentenceText: "",
}));

export const withoutSentenceDetails = <T extends Record<string, unknown>>(state: T) => ({
  ...state,
  sentence: [],
  recentCardIds: [],
  progressEntries: Array.isArray(state.progressEntries)
    ? activityCountsOnly(state.progressEntries as Activity[]) : [],
});

// Upgrade active and archived account snapshots before hydration, including old journals.
export const scrubStoredSentences = () => {
  for (const key of Object.keys(localStorage)) {
    if (key !== "pecs-storage" && !key.startsWith("expressly-account-data-v1:") && key !== "pecs-interactions-v1") continue;
    const raw = localStorage.getItem(key);
    if (!raw) continue;
    let stored: Record<string, unknown>;
    try { stored = JSON.parse(raw); } catch { continue; }
    if (!stored || typeof stored !== "object") continue;
    const clean = key === "pecs-interactions-v1"
      ? { ...stored, sentence: [], recentCardIds: [] }
      : stored.state && typeof stored.state === "object"
        ? { ...stored, state: withoutSentenceDetails(stored.state as Record<string, unknown>) } : stored;
    const encoded = JSON.stringify(clean);
    if (encoded !== raw) localStorage.setItem(key, encoded);
  }
};
