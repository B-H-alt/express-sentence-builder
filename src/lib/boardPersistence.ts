import type { PersistStorage, StorageValue } from "zustand/middleware";

type BoardState = Record<string, unknown>;
type StoredCard = { id: string; text?: string; usage?: number; [key: string]: unknown };
const KEY = "pecs-storage";
const JOURNAL = "pecs-interactions-v1";
const SCOPE = "expressly-active-account-scope-v1";
const hotKeys = new Set(["sentence", "cardUsage", "recentCardIds", "customCards"]);
let previous: BoardState | null = null;
let revision: string | null = null;
let builtinIds = new Set<string>();
export const registerBuiltinCardIds = (ids: string[]) => { builtinIds = new Set(ids); };
const legacyRevision = (raw: string) => {
  let hash = 2166136261;
  for (let index = 0; index < raw.length; index++) hash = Math.imul(hash ^ raw.charCodeAt(index), 16777619);
  return `legacy:${raw.length}:${hash >>> 0}`;
};
const counts = (value: unknown) => value !== null && typeof value === "object" && !Array.isArray(value) && Object.values(value).every(count => typeof count === "number" && Number.isFinite(count) && count >= 0);

const sameCardContent = (left: StoredCard[], right: StoredCard[]) => left.length === right.length && left.every((card, index) => {
  const other = right[index];
  if (card === other) return true;
  const keys = Object.keys(card).filter(key => key !== "usage");
  return keys.length === Object.keys(other).filter(key => key !== "usage").length && keys.every(key => card[key] === other[key]);
});

const read = (name: string): StorageValue<BoardState> | null => {
  const raw = localStorage.getItem(name);
  if (!raw) { previous = null; return null; }
  const stored = JSON.parse(raw) as StorageValue<BoardState> & { boardRevision?: string };
  revision = stored.boardRevision ?? legacyRevision(raw);
  if (name === KEY) {
    try {
      const journal = JSON.parse(localStorage.getItem(JOURNAL) || "null");
      if (journal?.version === 1 && journal.baseRevision === revision && journal.scope === localStorage.getItem(SCOPE) &&
        Array.isArray(journal.sentence) && journal.sentence.every(card => card && typeof card.id === "string" && typeof card.text === "string") &&
        Array.isArray(journal.recentCardIds) && journal.recentCardIds.every(id => typeof id === "string") && counts(journal.cardUsage) && counts(journal.customUsage)) {
        stored.state = {
          ...stored.state, sentence: journal.sentence, recentCardIds: journal.recentCardIds,
          cardUsage: journal.cardUsage,
          customCards: ((stored.state.customCards ?? []) as StoredCard[]).map(card => ({ ...card, usage: journal.customUsage?.[card.id] ?? card.usage })),
        };
      }
    } catch { /* A malformed journal must not prevent loading the board snapshot. */ }
  }
  previous = stored.state;
  return stored;
};

export const boardPersistence: PersistStorage<BoardState> = {
  getItem: read,
  setItem: (name, value) => {
    const state = value.state;
    const interactionOnly = name === KEY && previous &&
      Object.keys(state).every(key => hotKeys.has(key) || state[key] === previous![key]) &&
      sameCardContent((state.customCards ?? []) as StoredCard[], (previous.customCards ?? []) as StoredCard[]);
    if (interactionOnly) {
      const customIds = new Set(((state.customCards ?? []) as StoredCard[]).map(card => card.id));
      // Small, synchronous durable writes. No timers and no lost last taps on close.
      localStorage.setItem(JOURNAL, JSON.stringify({
        version: 1, baseRevision: revision, scope: localStorage.getItem(SCOPE),
        sentence: ((state.sentence ?? []) as StoredCard[]).map(card => builtinIds.has(card.id) || customIds.has(card.id)
          ? { id: card.id, text: card.text }
          : card),
        cardUsage: state.cardUsage, recentCardIds: state.recentCardIds,
        customUsage: Object.fromEntries(((state.customCards ?? []) as StoredCard[]).map(card => [card.id, card.usage])),
      }));
    } else {
      // Profile, photos, cards, settings and completed activity save in full immediately.
      const nextRevision = typeof crypto.randomUUID === "function" ? crypto.randomUUID()
        : Array.from(crypto.getRandomValues(new Uint32Array(4)), value => value.toString(16)).join("-");
      localStorage.setItem(name, JSON.stringify({ ...value, boardRevision: nextRevision }));
      revision = nextRevision;
      if (name === KEY) localStorage.removeItem(JOURNAL);
    }
    previous = state;
  },
  removeItem: name => {
    localStorage.removeItem(name);
    if (name === KEY) localStorage.removeItem(JOURNAL);
    previous = null;
  },
};

// Account switching archives the canonical snapshot, so fold in its last taps first.
export const flushBoardInteractions = () => {
  if (!localStorage.getItem(JOURNAL)) return;
  const value = read(KEY);
  if (value) localStorage.setItem(KEY, JSON.stringify(value));
  localStorage.removeItem(JOURNAL);
  previous = null;
};

export const clearBoardInteractions = () => {
  localStorage.removeItem(JOURNAL);
  previous = null;
};
