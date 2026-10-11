import { useCardStore } from "@/store/cardStore";

interface ExportAccount {
  id: string;
  email?: string;
}

export const downloadExpresslyData = (account: ExportAccount) => {
  const state = useCardStore.getState();
  const exportedAt = new Date();
  const data = {
    exportVersion: 1,
    exportedAt: exportedAt.toISOString(),
    account: {
      id: account.id,
      email: account.email ?? null,
    },
    learnerProfile: {
      name: state.userName,
      profileImage: state.userImage,
      characterPreference: state.characterGender,
      language: state.language,
      onboardingComplete: state.onboardingComplete,
    },
    preferences: {
      vocabularyLevel: state.currentLevel,
      cardsShown: state.cardsPerPage,
      showWords: state.showWords,
      calmMode: state.lowStimulationMode,
      textSize: state.textSize,
      speechRate: state.speechRate,
      speechVolume: state.speechVolume,
      hiddenCategories: state.hiddenCategories,
    },
    favorites: state.favorites,
    recentCards: state.recentCardIds,
    customCards: state.customCards.map((card) => ({
      id: card.id,
      text: card.text,
      category: card.category,
      imageUrl: card.imageUrl ?? null,
      image: card.image ?? null,
      usage: card.usage,
      level: card.level ?? null,
    })),
    currentSentence: state.sentence.map((card) => ({
      id: card.id,
      text: card.text,
      category: card.category,
    })),
    progressHistory: state.progressEntries,
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `expressly-data-${exportedAt.toISOString().slice(0, 10)}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
};

