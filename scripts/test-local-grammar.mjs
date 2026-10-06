import assert from "node:assert/strict";
import {
  composeSentenceLocally,
  localGrammarVocabulary,
} from "../src/utils/local-grammar.ts";

const exactCases = [
  [["I", "Want", "Water"], "I want water."],
  [["Water", "Want", "I"], "I want water."],
  [["She", "Happy"], "She is happy."],
  [["Happy", "He"], "He is happy."],
  [["You", "Tired"], "You are tired."],
  [["Mom", "Need", "Help"], "Mom needs help."],
  [["Want", "Mom"], "I want Mom."],
  [["Mom", "Want", "Water"], "Mom wants water."],
  [["He", "Don't want", "Food"], "He does not want food."],
  [["I", "Don't like", "Soup"], "I do not like soup."],
  [["Go", "Park", "Tomorrow", "I"], "I go to the park tomorrow."],
  [["Want", "Park"], "I want to go to the park."],
  [["Need", "Bathroom"], "I need the bathroom."],
  [["Play", "Park"], "I play at the park."],
  [["I", "Feel", "Happy"], "I feel happy."],
  [["You", "Brush teeth"], "You brush your teeth."],
  [["He", "Wash hands"], "He washes his hands."],
  [["She", "Ride bike"], "She rides her bike."],
  [["Mom", "Make bed"], "Mom makes their bed."],
  [["She", "Read", "Book", "Night"], "She reads a book in the night."],
  [["Where?", "Mom"], "Where is Mom?"],
  [["Where?", "She", "Go"], "Where does she go?"],
  [["What?", "You", "Want"], "What do you want?"],
  [["When?", "He", "Eat"], "When does he eat?"],
  [["Why?", "She", "Sad"], "Why is she sad?"],
  [["Why?", "She", "Want", "Water"], "Why does she want water?"],
  [["How?", "Dad"], "How is Dad?"],
  [["More", "Water"], "I want more water."],
  [["Thank you"], "Thank you."],
  [["I love you"], "I love you."],
  [["Happy"], "I am happy."],
  [["Play"], "I play."],
];

for (const [tokens, expected] of exactCases) {
  assert.equal(composeSentenceLocally(tokens), expected, tokens.join(" + "));
}

let generated = 0;
for (const subject of localGrammarVocabulary.subjects) {
  for (const verb of localGrammarVocabulary.verbs) {
    for (const object of ["Water", "Book", "Food", "Ball"]) {
      const result = composeSentenceLocally([subject, verb, object]);
      assert.ok(result.length > 2, `${subject} + ${verb} + ${object}`);
      assert.match(result, /[.!?]$/, result);
      assert.doesNotMatch(result, /undefined|null|\s{2,}/i, result);
      generated += 1;
    }
  }
}

for (const question of localGrammarVocabulary.questions) {
  const result = composeSentenceLocally([question, "She", "Want", "Water"]);
  assert.match(result, /\?$/, result);
  generated += 1;
}

console.log(`Local grammar checks passed: ${exactCases.length + generated}`);
