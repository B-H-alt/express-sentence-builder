import { activityCountsOnly, withoutSentenceDetails } from "./sentencePrivacy";
import { z } from "zod";
import { useCardStore } from "@/store/cardStore";
import { defaultAccessibility } from "@/lib/accessibilityPreferences";
import { flushBoardInteractions } from "@/lib/boardPersistence";

export const MAX_BACKUP_BYTES = 5 * 1024 * 1024;
const text = z.string().max(500);
const id = z.string().min(1).max(150);
const level = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);
const count = z.number().int().min(0).max(1_000_000_000);
// Reject executable URLs, SVG data, and local file/blob paths from imported files.
const image = z.string().max(MAX_BACKUP_BYTES).refine(value => {
  if (/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value)) return true;
  try { const url = new URL(value); return url.protocol === "https:" && !url.username && !url.password; } catch { return false; }
}, "Unsupported image URL");
const card = z.object({ id, text: text.min(1), category: text.min(1), imageUrl: image.nullish(), image: image.nullish(), usage: count, level: level.nullish() });
const backupSchema = z.object({
  exportVersion: z.literal(1),
  exportedAt: z.string().datetime(),
  learnerProfile: z.object({ name: text.nullable(), profileImage: image.nullable(), characterPreference: z.enum(["girl", "boy"]), language: z.enum(["en", "es"]), onboardingComplete: z.boolean() }),
  preferences: z.object({
    theme: z.enum(["light", "dark", "warm", "warm-dark", "sage", "sage-dark", "lavender", "lavender-dark", "rose", "rose-dark"]).optional(),
    vocabularyLevel: level, cardsShown: z.union([z.literal(4), z.literal(8), z.literal(12), z.literal("all")]),
    showWords: z.boolean(), calmMode: z.boolean(),
    accessibility: z.object({ reduceMotion: z.boolean(), plainBackgrounds: z.boolean(), softerColors: z.boolean(), strongerContrast: z.boolean() }).optional(),
    textSize: z.enum(["small", "default", "large"]), speechRate: z.number().min(.75).max(1.25), speechVolume: z.number().min(0).max(1), hiddenCategories: z.array(text).max(100),
  }),
  favorites: z.array(id).max(2000), recentCards: z.array(id).max(12), customCards: z.array(card).max(1000),
  savedPhrases: z.array(z.object({ id, text: z.string().min(1).max(500), language: z.enum(["en", "es"]) })).max(1000),
  currentSentence: z.array(z.object({ id, text, category: text })).max(500),
  progressHistory: z.array(z.object({ id, completedAt: z.string().datetime(), cardLabels: z.array(text).max(500), sentenceText: z.string().max(10000), wordCount: count })).max(10000),
  cardUsage: z.record(count).optional(),
});
export type BoardBackup = z.infer<typeof backupSchema>;

export const parseBoardBackup = (source: string): BoardBackup => {
  if (new Blob([source]).size > MAX_BACKUP_BYTES) throw new Error("Choose a backup smaller than 5 MB.");
  try {
    const data = backupSchema.parse(JSON.parse(source));
    const ids = data.customCards.map(card => card.id);
    const builtin = new Set(useCardStore.getState().cards.map(card => card.id));
    if (new Set(ids).size !== ids.length || ids.some(id => builtin.has(id))) throw new Error("Duplicate card IDs");
    return data;
  } catch {
    throw new Error("This file is not a supported Expressly backup. Your board has not changed.");
  }
};

export const restoreBoardBackup = (backup: BoardBackup) => {
  // Validate again at the mutation boundary. Never merge arbitrary file keys into the store.
  const data = parseBoardBackup(JSON.stringify(backup));
  flushBoardInteractions();
  const state = useCardStore.getState();
  const customCards = data.customCards.map(card => ({ ...card, image: card.image ?? undefined, imageUrl: card.imageUrl ?? undefined, level: card.level ?? data.preferences.vocabularyLevel }));
  const cards = state.cards.map(card => ({ ...card, usage: data.cardUsage?.[card.id] ?? 0 }));
  const byId = new Map([...cards, ...customCards].map(card => [card.id, card]));
  const restored = {
    userName: data.learnerProfile.name, userImage: data.learnerProfile.profileImage,
    characterGender: data.learnerProfile.characterPreference, language: data.learnerProfile.language,
    onboardingComplete: data.learnerProfile.onboardingComplete, currentLevel: data.preferences.vocabularyLevel,
    cardsPerPage: data.preferences.cardsShown, showWords: data.preferences.showWords, lowStimulationMode: data.preferences.calmMode,
    accessibility: data.preferences.accessibility ?? { ...defaultAccessibility }, textSize: data.preferences.textSize,
    speechRate: data.preferences.speechRate, speechVolume: data.preferences.speechVolume,
    hiddenCategories: data.preferences.hiddenCategories, customCards, cards, cardUsage: data.cardUsage ?? {},
    favorites: data.favorites.filter(id => byId.has(id)), recentCardIds: [],
    savedPhrases: data.savedPhrases, progressEntries: activityCountsOnly(data.progressHistory as { id: string; completedAt: string; wordCount: number }[]),
    sentence: [],
  };
  const oldData = localStorage.getItem("pecs-storage");
  const oldTheme = localStorage.getItem("expressly-theme");
  // Preflight the actual persisted payload before changing live state. Quota failures leave the board intact.
  const { cards: _cards, ...persisted } = restored;
  try {
    localStorage.setItem("pecs-storage", JSON.stringify({ state: withoutSentenceDetails(persisted), version: 15 }));
    if (data.preferences.theme) localStorage.setItem("expressly-theme", data.preferences.theme);
  } catch {
    if (localStorage.getItem("pecs-storage") !== oldData) {
      if (oldData !== null) localStorage.setItem("pecs-storage", oldData); else localStorage.removeItem("pecs-storage");
    }
    if (localStorage.getItem("expressly-theme") !== oldTheme) {
      if (oldTheme !== null) localStorage.setItem("expressly-theme", oldTheme); else localStorage.removeItem("expressly-theme");
    }
    throw new Error("There isn’t enough device storage to restore this backup. Your board has not changed.");
  }
  // This project's non-strict TS settings infer Zod object fields as optional;
  // the schema above has already checked all required fields at runtime.
  useCardStore.setState(restored as Partial<ReturnType<typeof useCardStore.getState>>);
};
