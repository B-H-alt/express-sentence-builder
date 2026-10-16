import type { Card } from "@/pages/PecsApp";

// Vocabulary consumers do not display usage counts. Preserve their references
// when a tap changes only usage, without altering the authoritative store cards.
export const createVocabularySelector = () => {
  let previousCards: Card[] | undefined;
  let previousCustom: Card[] | undefined;
  let previousLevel: number | undefined;
  let result: Card[] = [];
  return (state: { cards: Card[]; customCards: Card[]; currentLevel: number }) => {
    if (previousCards === state.cards && previousCustom === state.customCards && previousLevel === state.currentLevel) return result;
    previousCards = state.cards; previousCustom = state.customCards; previousLevel = state.currentLevel;
    const previousById = new Map(result.map(card => [card.id, card]));
    const available = new Map<string, Card>();
    for (const card of state.cards) if ((card.level ?? 1) <= state.currentLevel) available.set(card.id, card);
    for (const card of state.customCards) available.set(card.id, card);
    const next = Array.from(available.values(), card => {
      const old = previousById.get(card.id);
      return old && old.text === card.text && old.category === card.category && old.image === card.image && old.imageUrl === card.imageUrl && old.level === card.level ? old : card;
    });
    if (next.length !== result.length || next.some((card, index) => card !== result[index])) result = next;
    return result;
  };
};

export const selectVocabularyCards = createVocabularySelector();
