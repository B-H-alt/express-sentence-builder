import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets } from "./helpers";

test("new topic cards have unique artwork, Spanish labels, and cumulative access", async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.goto("/pecs-app");
  await page.getByRole("searchbox", { name: "Find a card" }).waitFor();
  const cards = await page.evaluate(async () => {
    const { useCardStore } = await import("/src/store/cardStore.ts");
    const { translateCardLabel } = await import("/src/lib/language.ts");
    return useCardStore.getState().cards.filter((card) => (card.level ?? 1) > 3)
      .map((card) => ({ ...card, spanish: translateCardLabel(card.text, "es") }));
  });
  expect(cards).toHaveLength(48);
  expect(new Set(cards.map((card) => card.image)).size).toBe(48);
  for (const card of cards) {
    expect(card.image, card.text).toBeTruthy();
    expect(card.spanish, card.text).not.toBe(card.text);
    expect(await page.evaluate(async (src) => {
      const image = new Image();
      image.src = src;
      await image.decode();
      return image.naturalWidth === 512 && image.naturalHeight === 512;
    }, card.image!)).toBe(true);
  }
});

test("level controls reveal topics without changing Home, and survive reload", async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.goto("/pecs-app");
  await page.getByRole("button", { name: "Open Test Learner's learner profile", exact: true }).click();
  await page.getByRole("menuitem", { name: "Profile & settings", exact: true }).click();
  await page.getByRole("tab", { name: "Display", exact: true }).click();
  await page.getByRole("button", { name: /Level 4 \(Explore\)/ }).click();
  await page.getByRole("button", { name: "Save level", exact: true }).click();
  await page.getByRole("button", { name: "Close settings", exact: true }).click();
  await expect(page.getByText("Your quick cards", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Animals", exact: true }).click();
  await page.getByRole("button", { name: "Add Dog to sentence", exact: true }).click();
  await expect(page.getByRole("button", { name: "Add Turtle to sentence", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Nature", exact: true }).click();
  await expect(page.getByRole("button", { name: "Add Leaf to sentence", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Sports", exact: true }).click();
  await expect(page.getByRole("button", { name: "Add Tennis racket to sentence", exact: true })).toBeVisible();
  // Test persistence in a fresh page without seedLearner's reload initializer.
  const fresh = await page.context().newPage();
  await fresh.goto("/pecs-app");
  await expect(fresh.getByText("Level 4 (Explore)", { exact: true })).toBeVisible();
  await fresh.getByRole("button", { name: "Open Test Learner's learner profile", exact: true }).click();
  await fresh.getByRole("menuitem", { name: "Profile & settings", exact: true }).click();
  await fresh.getByRole("tab", { name: "Display", exact: true }).click();
  await fresh.getByRole("button", { name: /Level 5 \(More interests\)/ }).click();
  await fresh.getByRole("button", { name: "Save level", exact: true }).click();
  await fresh.getByRole("button", { name: "Close settings", exact: true }).click();
  await fresh.getByRole("button", { name: "Animals", exact: true }).click();
  await expect(fresh.getByRole("button", { name: "Add Dog to sentence", exact: true })).toBeVisible();
  await expect(fresh.getByRole("button", { name: "Add Turtle to sentence", exact: true })).toBeVisible();
  await fresh.close();
});
