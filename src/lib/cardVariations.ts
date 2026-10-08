import type { AppLanguage } from "@/store/cardStore";

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

const spanishVariationsByLabel: Record<string, string[]> = {
  mom: ["Mamá", "Madre", "Mami"],
  dad: ["Papá", "Padre", "Papi"],
  mad: ["Enojado", "Molesto"],
  tired: ["Cansado", "Soñoliento"],
  scared: ["Asustado", "Con miedo"],
  friend: ["Amigo", "Compañero"],
  bathroom: ["Baño", "Servicio", "Inodoro"],
  hi: ["Hola", "Buenas"],
  bye: ["Adiós", "Hasta luego"],
  "all done": ["Terminé", "Acabé"],
  food: ["Comida", "Alimento"],
  help: ["Ayuda", "Ayúdame"],
};

export const getCardVariations = (label: string, language: AppLanguage = "en") =>
  (language === "es" ? spanishVariationsByLabel : variationsByLabel)[label.trim().toLocaleLowerCase()] ?? [];
