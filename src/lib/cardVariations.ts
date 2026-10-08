const variationsByLabel: Record<string, string[]> = {
  mom: ["Mom", "Mother", "Mama"],
  dad: ["Dad", "Father", "Papa"],
  mad: ["Mad", "Angry", "Upset"],
  tired: ["Tired", "Sleepy"],
  scared: ["Scared", "Afraid"],
  friend: ["Friend", "Buddy"],
  bathroom: ["Bathroom", "Restroom", "Toilet"],
  hi: ["Hi", "Hello"],
  bye: ["Bye", "Goodbye"],
  "all done": ["All done", "Finished"],
  food: ["Food", "Meal"],
  help: ["Help", "Help me"],
};

export const getCardVariations = (label: string) =>
  variationsByLabel[label.trim().toLocaleLowerCase()] ?? [];

