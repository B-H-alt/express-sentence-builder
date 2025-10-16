import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Card } from "@/pages/PecsApp";

export type VocabularyLevel = 1 | 2 | 3;

interface CardStore {
  cards: Card[];
  sentence: Card[];
  favorites: string[];
  currentLevel: VocabularyLevel;
  addToSentence: (card: Card) => void;
  removeFromSentence: (index: number) => void;
  clearSentence: () => void;
  toggleFavorite: (cardId: string) => void;
  incrementUsage: (cardId: string) => void;
  setLevel: (level: VocabularyLevel) => void;
  getFilteredCards: () => Card[];
}

// Level 1 - Beginner (46 cards)
const level1Cards: Card[] = [
  // People
  { id: "l1-1", text: "Mom", category: "people", usage: 0, level: 1 },
  { id: "l1-2", text: "Dad", category: "people", usage: 0, level: 1 },
  { id: "l1-3", text: "Teacher", category: "people", usage: 0, level: 1 },
  
  // Feelings
  { id: "l1-4", text: "Happy", category: "feelings", usage: 0, level: 1 },
  { id: "l1-5", text: "Sad", category: "feelings", usage: 0, level: 1 },
  { id: "l1-6", text: "Mad", category: "feelings", usage: 0, level: 1 },
  { id: "l1-7", text: "Tired", category: "feelings", usage: 0, level: 1 },
  { id: "l1-8", text: "Scared", category: "feelings", usage: 0, level: 1 },
  { id: "l1-9", text: "Excited", category: "feelings", usage: 0, level: 1 },
  { id: "l1-10", text: "Calm", category: "feelings", usage: 0, level: 1 },
  
  // Needs & Actions
  { id: "l1-11", text: "Eat", category: "actions", usage: 0, level: 1 },
  { id: "l1-12", text: "Drink", category: "actions", usage: 0, level: 1 },
  { id: "l1-13", text: "Help", category: "actions", usage: 0, level: 1 },
  { id: "l1-14", text: "Stop", category: "actions", usage: 0, level: 1 },
  { id: "l1-15", text: "More", category: "actions", usage: 0, level: 1 },
  { id: "l1-16", text: "All done", category: "actions", usage: 0, level: 1 },
  { id: "l1-17", text: "Go", category: "actions", usage: 0, level: 1 },
  { id: "l1-18", text: "Come", category: "actions", usage: 0, level: 1 },
  { id: "l1-19", text: "Want", category: "actions", usage: 0, level: 1 },
  { id: "l1-20", text: "Need", category: "actions", usage: 0, level: 1 },
  { id: "l1-21", text: "Finished", category: "actions", usage: 0, level: 1 },
  
  // Responses
  { id: "l1-22", text: "Yes", category: "responses", usage: 0, level: 1 },
  { id: "l1-23", text: "No", category: "responses", usage: 0, level: 1 },
  { id: "l1-24", text: "Maybe", category: "responses", usage: 0, level: 1 },
  
  // Activities
  { id: "l1-25", text: "Play", category: "activities", usage: 0, level: 1 },
  { id: "l1-26", text: "Read", category: "activities", usage: 0, level: 1 },
  { id: "l1-27", text: "Go outside", category: "activities", usage: 0, level: 1 },
  { id: "l1-28", text: "Listen to music", category: "activities", usage: 0, level: 1 },
  { id: "l1-29", text: "Draw", category: "activities", usage: 0, level: 1 },
  { id: "l1-30", text: "Build", category: "activities", usage: 0, level: 1 },
  
  // Objects/Items
  { id: "l1-31", text: "Toy", category: "objects", usage: 0, level: 1 },
  { id: "l1-32", text: "Book", category: "objects", usage: 0, level: 1 },
  { id: "l1-33", text: "Water", category: "objects", usage: 0, level: 1 },
  { id: "l1-34", text: "Food", category: "objects", usage: 0, level: 1 },
  { id: "l1-35", text: "Ball", category: "objects", usage: 0, level: 1 },
  { id: "l1-36", text: "Chair", category: "objects", usage: 0, level: 1 },
  { id: "l1-37", text: "Bed", category: "objects", usage: 0, level: 1 },
  
  // Places
  { id: "l1-38", text: "Home", category: "places", usage: 0, level: 1 },
  { id: "l1-39", text: "School", category: "places", usage: 0, level: 1 },
  { id: "l1-40", text: "Park", category: "places", usage: 0, level: 1 },
  { id: "l1-41", text: "Store", category: "places", usage: 0, level: 1 },
  
  // Social
  { id: "l1-42", text: "Hi", category: "social", usage: 0, level: 1 },
  { id: "l1-43", text: "Bye", category: "social", usage: 0, level: 1 },
  { id: "l1-44", text: "Please", category: "social", usage: 0, level: 1 },
  { id: "l1-45", text: "Thank you", category: "social", usage: 0, level: 1 },
  { id: "l1-46", text: "Sorry", category: "social", usage: 0, level: 1 },
];

// Level 2 - Intermediate (75 cards)
const level2Cards: Card[] = [
  ...level1Cards,
  { id: "l2-1", text: "brother", category: "people", usage: 0, level: 2 },
  { id: "l2-2", text: "sister", category: "people", usage: 0, level: 2 },
  { id: "l2-3", text: "friend", category: "people", usage: 0, level: 2 },
  { id: "l2-4", text: "nurse", category: "people", usage: 0, level: 2 },
  { id: "l2-5", text: "helper", category: "people", usage: 0, level: 2 },
  { id: "l2-6", text: "excited", category: "feelings", usage: 0, level: 2 },
  { id: "l2-7", text: "scared", category: "feelings", usage: 0, level: 2 },
  { id: "l2-8", text: "silly", category: "feelings", usage: 0, level: 2 },
  { id: "l2-9", text: "bored", category: "feelings", usage: 0, level: 2 },
  { id: "l2-10", text: "calm", category: "feelings", usage: 0, level: 2 },
  { id: "l2-11", text: "apple", category: "food", usage: 0, level: 2 },
  { id: "l2-12", text: "banana", category: "food", usage: 0, level: 2 },
  { id: "l2-13", text: "sandwich", category: "food", usage: 0, level: 2 },
  { id: "l2-14", text: "milk", category: "food", usage: 0, level: 2 },
  { id: "l2-15", text: "juice", category: "food", usage: 0, level: 2 },
  { id: "l2-16", text: "snack", category: "food", usage: 0, level: 2 },
  { id: "l2-17", text: "cookie", category: "food", usage: 0, level: 2 },
  { id: "l2-18", text: "ball", category: "objects", usage: 0, level: 2 },
  { id: "l2-19", text: "crayon", category: "objects", usage: 0, level: 2 },
  { id: "l2-20", text: "chair", category: "objects", usage: 0, level: 2 },
  { id: "l2-21", text: "table", category: "objects", usage: 0, level: 2 },
  { id: "l2-22", text: "tablet", category: "objects", usage: 0, level: 2 },
  { id: "l2-23", text: "shoes", category: "objects", usage: 0, level: 2 },
  { id: "l2-24", text: "jacket", category: "objects", usage: 0, level: 2 },
  { id: "l2-25", text: "school", category: "places", usage: 0, level: 2 },
  { id: "l2-26", text: "home", category: "places", usage: 0, level: 2 },
  { id: "l2-27", text: "park", category: "places", usage: 0, level: 2 },
  { id: "l2-28", text: "bathroom", category: "places", usage: 0, level: 2 },
  { id: "l2-29", text: "eat breakfast", category: "places", usage: 0, level: 2 },
  { id: "l2-30", text: "eat lunch", category: "places", usage: 0, level: 2 },
  { id: "l2-31", text: "eat dinner", category: "places", usage: 0, level: 2 },
  { id: "l2-32", text: "brush teeth", category: "places", usage: 0, level: 2 },
  { id: "l2-33", text: "wash hands", category: "places", usage: 0, level: 2 },
  { id: "l2-34", text: "sleep", category: "places", usage: 0, level: 2 },
  { id: "l2-35", text: "want", category: "actions", usage: 0, level: 2 },
  { id: "l2-36", text: "don't want", category: "actions", usage: 0, level: 2 },
  { id: "l2-37", text: "need", category: "actions", usage: 0, level: 2 },
  { id: "l2-38", text: "like", category: "actions", usage: 0, level: 2 },
  { id: "l2-39", text: "don't like", category: "actions", usage: 0, level: 2 },
  { id: "l2-40", text: "look", category: "actions", usage: 0, level: 2 },
  { id: "l2-41", text: "listen", category: "actions", usage: 0, level: 2 },
  { id: "l2-42", text: "sit", category: "actions", usage: 0, level: 2 },
  { id: "l2-43", text: "stand", category: "actions", usage: 0, level: 2 },
  { id: "l2-44", text: "come", category: "actions", usage: 0, level: 2 },
  { id: "l2-45", text: "go", category: "actions", usage: 0, level: 2 },
  { id: "l2-46", text: "wait", category: "actions", usage: 0, level: 2 },
  { id: "l2-47", text: "my turn", category: "actions", usage: 0, level: 2 },
  { id: "l2-48", text: "your turn", category: "actions", usage: 0, level: 2 },
  { id: "l2-49", text: "open", category: "actions", usage: 0, level: 2 },
  { id: "l2-50", text: "close", category: "actions", usage: 0, level: 2 },
  { id: "l2-51", text: "please", category: "social", usage: 0, level: 2 },
  { id: "l2-52", text: "thank you", category: "social", usage: 0, level: 2 },
  { id: "l2-53", text: "sorry", category: "social", usage: 0, level: 2 },
  { id: "l2-54", text: "good job", category: "social", usage: 0, level: 2 },
  { id: "l2-55", text: "I love you", category: "social", usage: 0, level: 2 },
  { id: "l2-56", text: "what?", category: "social", usage: 0, level: 2 },
  { id: "l2-57", text: "where?", category: "social", usage: 0, level: 2 },
  { id: "l2-58", text: "who?", category: "social", usage: 0, level: 2 },
  { id: "l2-59", text: "when?", category: "social", usage: 0, level: 2 },
  { id: "l2-60", text: "big", category: "descriptive", usage: 0, level: 2 },
  { id: "l2-61", text: "small", category: "descriptive", usage: 0, level: 2 },
  { id: "l2-62", text: "hot", category: "descriptive", usage: 0, level: 2 },
  { id: "l2-63", text: "cold", category: "descriptive", usage: 0, level: 2 },
  { id: "l2-64", text: "quiet", category: "descriptive", usage: 0, level: 2 },
];

// Level 3 - Advanced (150 cards)
const level3Cards: Card[] = [
  ...level2Cards,
  { id: "l3-1", text: "grandma", category: "people", usage: 0, level: 3 },
  { id: "l3-2", text: "grandpa", category: "people", usage: 0, level: 3 },
  { id: "l3-3", text: "classmate", category: "people", usage: 0, level: 3 },
  { id: "l3-4", text: "doctor", category: "people", usage: 0, level: 3 },
  { id: "l3-5", text: "bus driver", category: "people", usage: 0, level: 3 },
  { id: "l3-6", text: "frustrated", category: "feelings", usage: 0, level: 3 },
  { id: "l3-7", text: "proud", category: "feelings", usage: 0, level: 3 },
  { id: "l3-8", text: "nervous", category: "feelings", usage: 0, level: 3 },
  { id: "l3-9", text: "surprised", category: "feelings", usage: 0, level: 3 },
  { id: "l3-10", text: "angry", category: "feelings", usage: 0, level: 3 },
  { id: "l3-11", text: "orange", category: "food", usage: 0, level: 3 },
  { id: "l3-12", text: "pizza", category: "food", usage: 0, level: 3 },
  { id: "l3-13", text: "rice", category: "food", usage: 0, level: 3 },
  { id: "l3-14", text: "chicken", category: "food", usage: 0, level: 3 },
  { id: "l3-15", text: "fish", category: "food", usage: 0, level: 3 },
  { id: "l3-16", text: "soup", category: "food", usage: 0, level: 3 },
  { id: "l3-17", text: "ice cream", category: "food", usage: 0, level: 3 },
  { id: "l3-18", text: "playground", category: "places", usage: 0, level: 3 },
  { id: "l3-19", text: "store", category: "places", usage: 0, level: 3 },
  { id: "l3-20", text: "kitchen", category: "places", usage: 0, level: 3 },
  { id: "l3-21", text: "bedroom", category: "places", usage: 0, level: 3 },
  { id: "l3-22", text: "outside", category: "places", usage: 0, level: 3 },
  { id: "l3-23", text: "inside", category: "places", usage: 0, level: 3 },
  { id: "l3-24", text: "backpack", category: "objects", usage: 0, level: 3 },
  { id: "l3-25", text: "phone", category: "objects", usage: 0, level: 3 },
  { id: "l3-26", text: "computer", category: "objects", usage: 0, level: 3 },
  { id: "l3-27", text: "hat", category: "objects", usage: 0, level: 3 },
  { id: "l3-28", text: "pencil", category: "objects", usage: 0, level: 3 },
  { id: "l3-29", text: "eraser", category: "objects", usage: 0, level: 3 },
  { id: "l3-30", text: "desk", category: "objects", usage: 0, level: 3 },
  { id: "l3-31", text: "think", category: "actions", usage: 0, level: 3 },
  { id: "l3-32", text: "know", category: "actions", usage: 0, level: 3 },
  { id: "l3-33", text: "see", category: "actions", usage: 0, level: 3 },
  { id: "l3-34", text: "hear", category: "actions", usage: 0, level: 3 },
  { id: "l3-35", text: "touch", category: "actions", usage: 0, level: 3 },
  { id: "l3-36", text: "feel", category: "actions", usage: 0, level: 3 },
  { id: "l3-37", text: "talk", category: "actions", usage: 0, level: 3 },
  { id: "l3-38", text: "tell", category: "actions", usage: 0, level: 3 },
  { id: "l3-39", text: "ask", category: "actions", usage: 0, level: 3 },
  { id: "l3-40", text: "say", category: "actions", usage: 0, level: 3 },
  { id: "l3-41", text: "give", category: "actions", usage: 0, level: 3 },
  { id: "l3-42", text: "take", category: "actions", usage: 0, level: 3 },
  { id: "l3-43", text: "make", category: "actions", usage: 0, level: 3 },
  { id: "l3-44", text: "find", category: "actions", usage: 0, level: 3 },
  { id: "l3-45", text: "work", category: "actions", usage: 0, level: 3 },
  { id: "l3-46", text: "wash", category: "actions", usage: 0, level: 3 },
  { id: "l3-47", text: "brush", category: "actions", usage: 0, level: 3 },
  { id: "l3-48", text: "you're welcome", category: "social", usage: 0, level: 3 },
  { id: "l3-49", text: "how are you?", category: "social", usage: 0, level: 3 },
  { id: "l3-50", text: "what's wrong?", category: "social", usage: 0, level: 3 },
  { id: "l3-51", text: "I don't know", category: "social", usage: 0, level: 3 },
  { id: "l3-52", text: "can I have?", category: "social", usage: 0, level: 3 },
  { id: "l3-53", text: "I need help", category: "social", usage: 0, level: 3 },
  { id: "l3-54", text: "fast", category: "descriptive", usage: 0, level: 3 },
  { id: "l3-55", text: "slow", category: "descriptive", usage: 0, level: 3 },
  { id: "l3-56", text: "wet", category: "descriptive", usage: 0, level: 3 },
  { id: "l3-57", text: "dry", category: "descriptive", usage: 0, level: 3 },
  { id: "l3-58", text: "clean", category: "descriptive", usage: 0, level: 3 },
  { id: "l3-59", text: "dirty", category: "descriptive", usage: 0, level: 3 },
  { id: "l3-60", text: "loud", category: "descriptive", usage: 0, level: 3 },
  { id: "l3-61", text: "up", category: "descriptive", usage: 0, level: 3 },
  { id: "l3-62", text: "down", category: "descriptive", usage: 0, level: 3 },
  { id: "l3-63", text: "left", category: "descriptive", usage: 0, level: 3 },
  { id: "l3-64", text: "right", category: "descriptive", usage: 0, level: 3 },
  { id: "l3-65", text: "today", category: "time", usage: 0, level: 3 },
  { id: "l3-66", text: "tomorrow", category: "time", usage: 0, level: 3 },
  { id: "l3-67", text: "yesterday", category: "time", usage: 0, level: 3 },
  { id: "l3-68", text: "morning", category: "time", usage: 0, level: 3 },
  { id: "l3-69", text: "afternoon", category: "time", usage: 0, level: 3 },
  { id: "l3-70", text: "night", category: "time", usage: 0, level: 3 },
  { id: "l3-71", text: "why?", category: "time", usage: 0, level: 3 },
  { id: "l3-72", text: "how?", category: "time", usage: 0, level: 3 },
  { id: "l3-73", text: "color", category: "activities", usage: 0, level: 3 },
  { id: "l3-74", text: "draw", category: "activities", usage: 0, level: 3 },
  { id: "l3-75", text: "sing", category: "activities", usage: 0, level: 3 },
  { id: "l3-76", text: "dance", category: "activities", usage: 0, level: 3 },
  { id: "l3-77", text: "watch TV", category: "activities", usage: 0, level: 3 },
  { id: "l3-78", text: "play game", category: "activities", usage: 0, level: 3 },
  { id: "l3-79", text: "ride bike", category: "activities", usage: 0, level: 3 },
  { id: "l3-80", text: "go swimming", category: "activities", usage: 0, level: 3 },
  { id: "l3-81", text: "build blocks", category: "activities", usage: 0, level: 3 },
];

const allCards = level3Cards;

export const useCardStore = create<CardStore>()(
  persist(
    (set, get) => ({
      cards: allCards,
      sentence: [],
      favorites: [],
      currentLevel: 1,
      
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
      
      setLevel: (level) => set({ currentLevel: level }),
      
      getFilteredCards: () => {
        const state = get();
        return state.cards.filter(card => (card.level || 1) <= state.currentLevel);
      },
    }),
    {
      name: "pecs-storage",
      version: 2, // Increment to force card updates
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          // Force reload with new card data
          return {
            ...persistedState,
            cards: allCards,
          };
        }
        return persistedState;
      },
    }
  )
);
