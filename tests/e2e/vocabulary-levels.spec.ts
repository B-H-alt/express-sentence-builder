import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets } from "./helpers";

test("levels are cumulative, counts are accurate, and legacy IDs stay intact", async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.goto("/pecs-app");
  await page.getByRole("searchbox", { name: "Find a card" }).waitFor();
  const result = await page.evaluate(async (path) => {
    const { useCardStore, vocabularyLevelCounts } = await import(path);
    const state = useCardStore.getState();
    const levels = [1, 2, 3, 4, 5].map((level) => {
      state.setLevel(level);
      return useCardStore.getState().getFilteredCards().map((card) => ({ id: card.id, text: card.text }));
    });
    return { levels, counts: vocabularyLevelCounts, unique: new Set(state.cards.map((card) => card.id)).size === state.cards.length };
  }, "/src/store/cardStore.ts");
  expect(result.unique).toBe(true);
  for (const card of result.levels[2].filter((card) => card.id.startsWith("l1-"))) {
    expect(result.levels[0]).toContainEqual(card);
  }
  expect(result.levels.map((cards) => cards.length)).toEqual([65, 160, 196, 220, 244]);
  for (let level = 0; level < 5; level += 1) {
    expect(result.levels[level].length).toBe(result.counts[level + 1]);
    if (level > 0) for (const card of result.levels[level - 1]) expect(result.levels[level]).toContainEqual(card);
  }
  for (const text of ["I", "You", "Bathroom", "Don't want", "Like", "Don't like", "Feel", "Wait", "Hot", "Cold", "Quiet", "Loud", "Snack", "Stomach", "I need help"]) {
    expect(result.levels[0].some((card) => card.text === text), text).toBe(true);
  }
  for (const text of ["Give", "Take", "Make", "Find", "Grandma", "Grandpa", "Doctor", "Rice", "Chicken", "Teeth", "Arm", "Leg", "Now", "Later", "I don't know"]) {
    expect(result.levels[1].some((card) => card.text === text), text).toBe(true);
  }
  expect(result.levels[0]).toContainEqual({ id: "l2-20", text: "Bathroom" });
  expect(result.levels[2].some((card) => card.text === "Tomorrow")).toBe(true);
  expect(result.levels[1].some((card) => card.text === "Tomorrow")).toBe(false);
  const personalData = await page.evaluate(async (path) => {
    const { useCardStore } = await import(path);
    useCardStore.setState({ customCards: [{ id: "custom-level-check", text: "My personal word", category: "objects", level: 3, usage: 0 }], favorites: ["l2-20"] });
    useCardStore.getState().setLevel(1);
    return { customAvailable: useCardStore.getState().getFilteredCards().some((card) => card.id === "custom-level-check"), favorites: useCardStore.getState().favorites };
  }, "/src/store/cardStore.ts");
  expect(personalData).toEqual({ customAvailable: true, favorites: ["l2-20"] });
});

test("promoted vocabulary has visible categories and accurate settings", async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.goto("/pecs-app");
  await page.getByRole("button", { name: "Food", exact: true }).click();
  await expect(page.getByRole("button", { name: "Add Snack to sentence", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Descriptive", exact: true }).click();
  await expect(page.getByRole("button", { name: "Add Quiet to sentence", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Open Test Learner's learner profile", exact: true }).click();
  await page.getByRole("menuitem", { name: "Profile & settings", exact: true }).click();
  await page.getByRole("tab", { name: "Display", exact: true }).click();
  await expect(page.getByText(/Everyday needs and core words \(\d+ built-in cards\)/)).toBeVisible();
  await page.getByRole("button", { name: /Level 2 \(Intermediate\)/ }).click();
  await page.getByRole("button", { name: "Close settings", exact: true }).click();
  await page.getByRole("button", { name: "Time", exact: true }).click();
  await expect(page.getByRole("button", { name: "Add Now to sentence", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Later to sentence", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Tomorrow to sentence", exact: true })).toHaveCount(0);
});
