type Tense = "past" | "present" | "future";

const subjects: Record<string, { label: string; plural?: boolean; first?: boolean }> = {
  i: { label: "I", first: true }, you: { label: "You", plural: true },
  he: { label: "He" }, she: { label: "She" }, we: { label: "We", plural: true },
  they: { label: "They", plural: true }, mom: { label: "Mom" }, mum: { label: "Mum" },
  mommy: { label: "Mommy" }, mama: { label: "Mama" }, dad: { label: "Dad" },
  daddy: { label: "Daddy" }, papa: { label: "Papa" },
  grandma: { label: "Grandma" }, grandpa: { label: "Grandpa" },
};
const actions: Record<string, { past: string; progressive: string; object: boolean }> = {
  eat: { past: "ate", progressive: "eating", object: true },
  drink: { past: "drank", progressive: "drinking", object: true },
  play: { past: "played", progressive: "playing", object: false },
  sleep: { past: "slept", progressive: "sleeping", object: false },
  walk: { past: "walked", progressive: "walking", object: false },
  run: { past: "ran", progressive: "running", object: false },
  swim: { past: "swam", progressive: "swimming", object: false },
  dance: { past: "danced", progressive: "dancing", object: false },
  sing: { past: "sang", progressive: "singing", object: false },
};
const objects: Record<string, string> = {
  water: "water", milk: "milk", juice: "juice", food: "food", rice: "rice", soup: "soup",
  pizza: "pizza", chicken: "chicken", fish: "fish", "ice cream": "ice cream",
  apple: "an apple", banana: "a banana", sandwich: "a sandwich", cookie: "a cookie",
  orange: "an orange", snack: "a snack", help: "help",
};
const feelings = new Set(["happy", "sad", "mad", "angry", "tired", "scared", "excited", "calm", "silly", "bored", "frustrated", "proud", "nervous", "surprised", "hungry", "thirsty", "hot", "cold"]);

/** Deliberately narrow: unknown vocabulary, negation, and ambiguous structures remain untouched. */
export const correctOfflineGrammar = (tokens: string[], tense: Tense, language: "en" | "es"): string => {
  if (language !== "en") return "";
  const words = tokens.join(" ").trim().toLowerCase().split(/\s+/);
  const subject = subjects[words[0]];
  if (!subject || words.length < 2) return "";
  const verb = words[1];
  const remainder = words.slice(2).join(" ");
  const be = tense === "future" ? "will be" : tense === "past"
    ? subject.plural ? "were" : "was"
    : subject.first ? "am" : subject.plural ? "are" : "is";
  if (words.length === 2 && feelings.has(verb)) return `${subject.label} ${be} ${verb}.`;
  if (["want", "need", "like"].includes(verb) && objects[remainder]) {
    const predicate = tense === "future" ? `will ${verb}` : tense === "past"
      ? { want: "wanted", need: "needed", like: "liked" }[verb]
      : subject.first || subject.plural ? verb : `${verb}s`;
    return `${subject.label} ${predicate} ${objects[remainder]}.`;
  }
  const action = actions[verb];
  if (!action || (remainder && (!action.object || !objects[remainder]))) return "";
  if (remainder && verb === "drink" && !["water", "milk", "juice"].includes(remainder)) return "";
  if (remainder && verb === "eat" && ["water", "milk", "juice", "help"].includes(remainder)) return "";
  const predicate = tense === "future" ? `will ${verb}` : tense === "past" ? action.past : `${be} ${action.progressive}`;
  return `${subject.label} ${predicate}${remainder ? ` ${objects[remainder]}` : ""}.`;
};
