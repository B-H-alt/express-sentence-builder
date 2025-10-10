import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Card } from "@/pages/PecsApp";

interface CardStore {
  cards: Card[];
  sentence: Card[];
  favorites: string[];
  addToSentence: (card: Card) => void;
  removeFromSentence: (index: number) => void;
  clearSentence: () => void;
  toggleFavorite: (cardId: string) => void;
  incrementUsage: (cardId: string) => void;
}

// Sample cards - in a real app, these would come from a backend or be user-managed
const initialCards: Card[] = [
  // Actions
  { id: "1", text: "I want", category: "actions", usage: 0 },
  { id: "2", text: "I need", category: "actions", usage: 0 },
  { id: "3", text: "help", category: "actions", usage: 0 },
  { id: "4", text: "go", category: "actions", usage: 0 },
  { id: "5", text: "play", category: "actions", usage: 0 },
  { id: "6", text: "eat", category: "actions", usage: 0 },
  { id: "7", text: "drink", category: "actions", usage: 0 },
  { id: "8", text: "sleep", category: "actions", usage: 0 },
  
  // People
  { id: "9", text: "mom", category: "people", usage: 0 },
  { id: "10", text: "dad", category: "people", usage: 0 },
  { id: "11", text: "teacher", category: "people", usage: 0 },
  { id: "12", text: "friend", category: "people", usage: 0 },
  
  // Places
  { id: "13", text: "home", category: "places", usage: 0 },
  { id: "14", text: "school", category: "places", usage: 0 },
  { id: "15", text: "park", category: "places", usage: 0 },
  { id: "16", text: "bathroom", category: "places", usage: 0 },
  
  // Food
  { id: "17", text: "water", category: "food", usage: 0 },
  { id: "18", text: "juice", category: "food", usage: 0 },
  { id: "19", text: "cookie", category: "food", usage: 0 },
  { id: "20", text: "apple", category: "food", usage: 0 },
  { id: "21", text: "sandwich", category: "food", usage: 0 },
  
  // Feelings
  { id: "22", text: "happy", category: "feelings", usage: 0 },
  { id: "23", text: "sad", category: "feelings", usage: 0 },
  { id: "24", text: "tired", category: "feelings", usage: 0 },
  { id: "25", text: "angry", category: "feelings", usage: 0 },
];

export const useCardStore = create<CardStore>()(
  persist(
    (set) => ({
      cards: initialCards,
      sentence: [],
      favorites: [],
      
      addToSentence: (card) =>
        set((state) => ({
          sentence: [...state.sentence, card],
        })),
      
      removeFromSentence: (index) =>
        set((state) => ({
          sentence: state.sentence.filter((_, i) => i !== index),
        })),
      
      clearSentence: () => set({ sentence: [] }),
      
      toggleFavorite: (cardId) =>
        set((state) => ({
          favorites: state.favorites.includes(cardId)
            ? state.favorites.filter((id) => id !== cardId)
            : [...state.favorites, cardId],
        })),
      
      incrementUsage: (cardId) =>
        set((state) => ({
          cards: state.cards.map((card) =>
            card.id === cardId ? { ...card, usage: card.usage + 1 } : card
          ),
        })),
    }),
    {
      name: "pecs-storage",
    }
  )
);
