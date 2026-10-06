type SubjectInfo = {
  text: string;
  agreement: "first" | "second" | "third";
};

type VerbInfo = {
  base: string;
  third: string;
  selfDirected?: boolean;
  possessive?: boolean;
};

const QUESTION_WORDS = new Set(["what", "where", "who", "when", "why", "how"]);

const PEOPLE = new Set([
  "mom", "dad", "teacher", "brother", "sister", "friend", "nurse",
  "grandma", "grandpa", "classmate", "doctor", "bus driver",
]);

const FEELINGS = new Set([
  "happy", "sad", "mad", "tired", "scared", "excited", "calm", "silly",
  "bored", "frustrated", "proud", "nervous", "surprised", "hot", "cold",
]);

const DESCRIPTIONS = new Set([
  "big", "small", "quiet", "fast", "slow", "wet", "dry", "clean", "dirty",
  "loud", "up", "down", "left", "right",
]);

const PLACES = new Set([
  "home", "school", "park", "store", "bathroom", "playground", "kitchen",
  "bedroom", "outside", "inside",
]);

const TIMES = new Set([
  "today", "tomorrow", "yesterday", "morning", "afternoon", "night", "now", "later",
]);

const RESPONSES = new Set(["yes", "no", "maybe"]);

const FIXED_PHRASES: Record<string, string> = {
  "all done": "I am all done.",
  hi: "Hi.",
  bye: "Bye.",
  please: "Please.",
  "thank you": "Thank you.",
  sorry: "Sorry.",
  "my turn": "It is my turn.",
  "your turn": "It is your turn.",
  "good job": "Good job.",
  "i love you": "I love you.",
  "you're welcome": "You're welcome.",
  "how are you": "How are you?",
  "what's wrong": "What's wrong?",
  "i don't know": "I don't know.",
  "can i have": "Can I have it?",
  "i need help": "I need help.",
};

const VERBS: Record<string, VerbInfo> = {
  eat: { base: "eat", third: "eats", selfDirected: true },
  drink: { base: "drink", third: "drinks", selfDirected: true },
  help: { base: "help", third: "helps", selfDirected: true },
  stop: { base: "stop", third: "stops", selfDirected: true },
  go: { base: "go", third: "goes", selfDirected: true },
  come: { base: "come", third: "comes", selfDirected: true },
  want: { base: "want", third: "wants", selfDirected: true },
  need: { base: "need", third: "needs", selfDirected: true },
  play: { base: "play", third: "plays", selfDirected: true },
  read: { base: "read", third: "reads", selfDirected: true },
  draw: { base: "draw", third: "draws", selfDirected: true },
  build: { base: "build", third: "builds", selfDirected: true },
  like: { base: "like", third: "likes", selfDirected: true },
  look: { base: "look", third: "looks", selfDirected: true },
  listen: { base: "listen", third: "listens", selfDirected: true },
  sit: { base: "sit", third: "sits", selfDirected: true },
  stand: { base: "stand", third: "stands", selfDirected: true },
  wait: { base: "wait", third: "waits", selfDirected: true },
  open: { base: "open", third: "opens", selfDirected: true },
  close: { base: "close", third: "closes", selfDirected: true },
  "put away": { base: "put away", third: "puts away", selfDirected: true },
  brush: { base: "brush", third: "brushes", selfDirected: true },
  shower: { base: "shower", third: "showers", selfDirected: true },
  blow: { base: "blow", third: "blows", selfDirected: true },
  cut: { base: "cut", third: "cuts", selfDirected: true },
  think: { base: "think", third: "thinks", selfDirected: true },
  know: { base: "know", third: "knows", selfDirected: true },
  see: { base: "see", third: "sees", selfDirected: true },
  hear: { base: "hear", third: "hears", selfDirected: true },
  touch: { base: "touch", third: "touches", selfDirected: true },
  feel: { base: "feel", third: "feels", selfDirected: true },
  talk: { base: "talk", third: "talks", selfDirected: true },
  tell: { base: "tell", third: "tells", selfDirected: true },
  ask: { base: "ask", third: "asks", selfDirected: true },
  say: { base: "say", third: "says", selfDirected: true },
  give: { base: "give", third: "gives", selfDirected: true },
  take: { base: "take", third: "takes", selfDirected: true },
  make: { base: "make", third: "makes", selfDirected: true },
  find: { base: "find", third: "finds", selfDirected: true },
  work: { base: "work", third: "works", selfDirected: true },
  color: { base: "color", third: "colors", selfDirected: true },
  sing: { base: "sing", third: "sings", selfDirected: true },
  dance: { base: "dance", third: "dances", selfDirected: true },
  floss: { base: "floss", third: "flosses", selfDirected: true },
  "go outside": { base: "go outside", third: "goes outside", selfDirected: true },
  "listen to music": { base: "listen to music", third: "listens to music", selfDirected: true },
  "eat breakfast": { base: "eat breakfast", third: "eats breakfast", selfDirected: true },
  "eat lunch": { base: "eat lunch", third: "eats lunch", selfDirected: true },
  "eat dinner": { base: "eat dinner", third: "eats dinner", selfDirected: true },
  "brush teeth": { base: "brush teeth", third: "brushes teeth", selfDirected: true, possessive: true },
  "wash hands": { base: "wash hands", third: "washes hands", selfDirected: true, possessive: true },
  "make bed": { base: "make bed", third: "makes bed", selfDirected: true, possessive: true },
  "watch tv": { base: "watch TV", third: "watches TV", selfDirected: true },
  "play game": { base: "play a game", third: "plays a game", selfDirected: true },
  "ride bike": { base: "ride bike", third: "rides bike", selfDirected: true, possessive: true },
  "go swimming": { base: "go swimming", third: "goes swimming", selfDirected: true },
  "build blocks": { base: "build with blocks", third: "builds with blocks", selfDirected: true },
};

const normalize = (value: string) =>
  value.trim().replace(/[.!?]+$/g, "").replace(/\s+/g, " ").toLocaleLowerCase();

const sentenceCase = (value: string, question = false) => {
  const cleaned = value.replace(/\s+/g, " ").trim();
  if (!cleaned) return "";
  const capitalized = cleaned.charAt(0).toLocaleUpperCase() + cleaned.slice(1);
  return `${capitalized.replace(/[.!?]+$/g, "")}${question ? "?" : "."}`;
};

const articleFor = (word: string) => (/^[aeiou]/i.test(word) ? "an" : "a");

const naturalObject = (value: string) => {
  const lower = normalize(value);
  if (["water", "food", "milk", "juice", "rice", "soup", "ice cream", "help", "clothes"].includes(lower)) {
    return lower;
  }
  if (PLACES.has(lower) || TIMES.has(lower)) return lower;
  if (PEOPLE.has(lower)) return value;
  if (/^(my|your|the|a|an)\b/i.test(value)) return value.toLocaleLowerCase();
  return `${articleFor(lower)} ${lower}`;
};

const subjectFor = (token: string): SubjectInfo | null => {
  const lower = normalize(token);
  if (lower === "i" || lower === "me") return { text: "I", agreement: "first" };
  if (lower === "you") return { text: "You", agreement: "second" };
  if (lower === "he") return { text: "He", agreement: "third" };
  if (lower === "she") return { text: "She", agreement: "third" };
  if (PEOPLE.has(lower)) return { text: token.trim(), agreement: "third" };
  return null;
};

const joinObjects = (values: string[]) => {
  const unique = Array.from(new Set(values.map(naturalObject)));
  if (unique.length <= 1) return unique[0] ?? "";
  if (unique.length === 2) return `${unique[0]} and ${unique[1]}`;
  return `${unique.slice(0, -1).join(", ")}, and ${unique.at(-1)}`;
};

const placePhrase = (place: string, isMovement: boolean) => {
  const lower = normalize(place);
  if (lower === "home") return isMovement ? "home" : "at home";
  if (lower === "outside" || lower === "inside") return lower;
  if (isMovement) return `to the ${lower}`;
  if (["kitchen", "bedroom", "bathroom"].includes(lower)) return `in the ${lower}`;
  return `at the ${lower}`;
};

const timePhrase = (time: string) => {
  const lower = normalize(time);
  if (["today", "tomorrow", "yesterday", "now", "later"].includes(lower)) return lower;
  return `in the ${lower}`;
};

const auxiliaryForQuestion = (subject: SubjectInfo) =>
  subject.agreement === "third" ? "does" : "do";

const verbForSubject = (verb: VerbInfo, subject: SubjectInfo, useBase = false) => {
  const phrase = useBase || subject.agreement !== "third" ? verb.base : verb.third;
  if (!verb.possessive) return phrase;

  const possessive = subject.agreement === "first"
    ? "my"
    : subject.agreement === "second"
      ? "your"
      : subject.text.toLocaleLowerCase() === "he"
        ? "his"
        : subject.text.toLocaleLowerCase() === "she"
          ? "her"
          : "their";
  const [action, ...remainder] = phrase.split(" ");
  return `${action} ${possessive} ${remainder.join(" ")}`;
};

const composeQuestion = (
  question: string,
  subject: SubjectInfo | null,
  verb: VerbInfo | null,
  objects: string[],
  adjective: string | null,
  place: string | null,
  time: string | null,
) => {
  const q = normalize(question);
  const effectiveSubject = subject ?? { text: "I", agreement: "first" as const };
  const questionSubject = ["You", "He", "She"].includes(effectiveSubject.text)
    ? effectiveSubject.text.toLocaleLowerCase()
    : effectiveSubject.text;
  const objectText = joinObjects(objects);
  const complements = [
    objectText,
    place ? placePhrase(place, verb?.base.startsWith("go") ?? false) : "",
    time ? timePhrase(time) : "",
  ].filter(Boolean).join(" ");

  if (q === "where") {
    if (verb) return sentenceCase(`where ${auxiliaryForQuestion(effectiveSubject)} ${questionSubject} ${verbForSubject(verb, effectiveSubject, true)}`, true);
    return sentenceCase(`where is ${(subject?.text ?? objectText) || "it"}`, true);
  }

  if (q === "who") {
    if (verb) return sentenceCase(`who ${verb.third}${objectText ? ` ${objectText}` : ""}`, true);
    return sentenceCase(`who is ${(adjective ?? place ?? objectText) || "there"}`, true);
  }

  if (q === "what") {
    if (verb) {
      return sentenceCase(`what ${auxiliaryForQuestion(effectiveSubject)} ${questionSubject} ${verbForSubject(verb, effectiveSubject, true)}`, true);
    }
    return sentenceCase(`what is ${(adjective ?? objectText) || "that"}`, true);
  }

  if (q === "when" || q === "why" || q === "how") {
    if (verb) {
      const detail = q === "why" || q === "how" ? complements : objectText;
      return sentenceCase(`${q} ${auxiliaryForQuestion(effectiveSubject)} ${questionSubject} ${verbForSubject(verb, effectiveSubject, true)}${detail ? ` ${detail}` : ""}`, true);
    }
    if (adjective) {
      return sentenceCase(`${q} is ${questionSubject}${q === "why" ? ` ${adjective}` : ""}`, true);
    }
    if (q === "when" && time) return sentenceCase(`when is ${timePhrase(time)}`, true);
    return sentenceCase(`${q} is ${(subject?.text ?? objectText) || "it"}`, true);
  }

  return "";
};

/**
 * Composes common AAC card combinations without a network request. It is
 * deliberately conservative: unknown combinations return an empty string so
 * the secure server fallback can handle them without the local engine guessing.
 */
export const composeSentenceLocally = (labels: string[]): string => {
  const tokens = labels.map((label) => label.trim()).filter(Boolean);
  if (!tokens.length) return "";

  if (tokens.length === 1) {
    const only = normalize(tokens[0]);
    if (FIXED_PHRASES[only]) return FIXED_PHRASES[only];
    if (RESPONSES.has(only)) return sentenceCase(only);
    if (FEELINGS.has(only)) return sentenceCase(`I am ${only}`);
    if (DESCRIPTIONS.has(only)) return sentenceCase(`It is ${only}`);
    const singleVerb = VERBS[only];
    if (singleVerb?.selfDirected) return sentenceCase(`I ${singleVerb.base}`);
    if (QUESTION_WORDS.has(only)) return sentenceCase(only, true);
    return sentenceCase(tokens[0]);
  }

  let question: string | null = null;
  let subject: SubjectInfo | null = null;
  let verb: VerbInfo | null = null;
  let adjective: string | null = null;
  let place: string | null = null;
  let time: string | null = null;
  let negative: "want" | "like" | null = null;
  let wantsMore = false;
  const objects: string[] = [];
  const fixed: string[] = [];

  for (const token of tokens) {
    const lower = normalize(token);
    if (QUESTION_WORDS.has(lower) && !question) {
      question = lower;
      continue;
    }
    const possibleSubject = subjectFor(token);
    const isPronoun = ["i", "me", "you", "he", "she"].includes(lower);
    if (possibleSubject && !subject && (isPronoun || !verb)) {
      subject = possibleSubject;
      continue;
    }
    if (lower === "don't want" || lower === "dont want") {
      negative = "want";
      verb = VERBS.want;
      continue;
    }
    if (lower === "don't like" || lower === "dont like") {
      negative = "like";
      verb = VERBS.like;
      continue;
    }
    if (lower === "more") {
      wantsMore = true;
      continue;
    }
    if (VERBS[lower] && !verb) {
      verb = VERBS[lower];
      continue;
    }
    if ((FEELINGS.has(lower) || DESCRIPTIONS.has(lower) || lower === "finished") && !adjective) {
      adjective = lower;
      continue;
    }
    if (PLACES.has(lower) && !place) {
      place = token;
      continue;
    }
    if (TIMES.has(lower) && !time) {
      time = token;
      continue;
    }
    if (FIXED_PHRASES[lower]) {
      fixed.push(FIXED_PHRASES[lower].replace(/[.!?]+$/g, ""));
      continue;
    }
    if (!RESPONSES.has(lower)) objects.push(token);
  }

  if (question) return composeQuestion(question, subject, verb, objects, adjective, place, time);

  if (!subject && (verb?.selfDirected || adjective || negative || wantsMore)) {
    subject = { text: "I", agreement: "first" };
  }

  if (wantsMore && !verb) verb = VERBS.want;
  if (!subject && !verb && !adjective && fixed.length) return sentenceCase(fixed.join(" "));
  if (!subject) return "";

  const parts = [subject.text];
  if (adjective && !verb) {
    const linking = subject.agreement === "third" ? "is" : subject.agreement === "second" ? "are" : "am";
    parts.push(linking, adjective);
  } else if (verb) {
    if (negative) {
      parts.push(subject.agreement === "third" ? "does not" : "do not", negative);
    } else {
      parts.push(verbForSubject(verb, subject));
      if (verb.base === "feel" && adjective) parts.push(adjective);
    }
  }

  const objectText = wantsMore
    ? objects.length
      ? `more ${objects.map((item) => normalize(item)).join(" and ")}`
      : "more"
    : joinObjects(objects);
  if (objectText) parts.push(objectText);
  if (place) {
    if (verb?.base === "want") parts.push(`to go ${placePhrase(place, true)}`);
    else if (["need", "like", "see", "find"].includes(verb?.base ?? "")) {
      parts.push(`the ${normalize(place)}`);
    } else parts.push(placePhrase(place, verb?.base.startsWith("go") ?? false));
  }
  if (time) parts.push(timePhrase(time));
  if (fixed.length) parts.push(fixed.join(" ").toLocaleLowerCase());

  return sentenceCase(parts.join(" "));
};

export const localGrammarVocabulary = {
  questions: Array.from(QUESTION_WORDS),
  subjects: ["I", "You", "He", "She", ...Array.from(PEOPLE)],
  verbs: Object.keys(VERBS),
  feelings: Array.from(FEELINGS),
  places: Array.from(PLACES),
  times: Array.from(TIMES),
};
