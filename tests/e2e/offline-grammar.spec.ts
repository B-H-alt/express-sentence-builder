import { expect, test } from "@playwright/test";
import { correctOfflineGrammar } from "../../src/utils/offline-grammar";

test("offline grammar handles explicit subjects and tense without inventing intent", () => {
  const cases: [string[], "past" | "present" | "future", string][] = [
    [["Mom", "Eat"], "present", "Mom is eating."],
    [["Papa", "Drink", "Water"], "present", "Papa is drinking water."],
    [["I", "Happy"], "present", "I am happy."],
    [["They", "Sad"], "past", "They were sad."],
    [["She", "Run"], "present", "She is running."],
    [["Mom", "Eat", "Apple"], "past", "Mom ate an apple."],
    [["He", "Sleep"], "future", "He will sleep."],
    [["I want", "Water"], "present", "I want water."],
    [["She", "Need", "Help"], "present", "She needs help."],
    [["I", "Want", "Cookie"], "future", "I will want a cookie."],
  ];
  for (const [tokens, tense, expected] of cases) expect(correctOfflineGrammar(tokens, tense, "en")).toBe(expected);
  for (const tokens of [["Eat"], ["Mom", "No", "Eat"], ["Mom", "Dad", "Eat"], ["I", "Want", "Unknown"], ["Mom", "Eat", "Help"], ["He", "Drink", "Cookie"], ["Mom", "Eat", "Yesterday"], ["I", "am", "happy"]]) {
    expect(correctOfflineGrammar(tokens, "present", "en")).toBe("");
  }
  expect(correctOfflineGrammar(["Mamá", "Comer"], "present", "es")).toBe("");
});
