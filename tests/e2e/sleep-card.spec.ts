import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets } from "./helpers";

test("Sleep is a Level 1 action with matched character artwork and Spanish vocabulary", async ({ page }) => {
  await seedLearner(page); await blockThirdPartyWidgets(page);
  await page.goto("/pecs-app");
  await page.getByRole("searchbox", { name: "Find a card", exact: true }).fill("sleep");
  const card = page.getByRole("button", { name: "Add Sleep to sentence", exact: true });
  await expect(card.locator('img[alt="Sleep"]')).toHaveAttribute("src", /girl\/core-sleep\.jpg/);
  await expect.poll(() => card.locator('img[alt="Sleep"]').evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  await card.click();
  await expect(page.getByRole("button", { name: "Remove Sleep from sentence", exact: true })).toBeVisible();
  const details = await page.evaluate(async () => {
    const { useCardStore, vocabularyLevelCounts } = await import("/src/store/cardStore.ts");
    const state = useCardStore.getState();
    const sleep = state.cards.find(card => card.id === "core-sleep");
    state.setCharacterGender("boy");
    return { level: sleep?.level, category: sleep?.category, count: state.cards.filter(card => card.id === "core-sleep").length, levelOne: vocabularyLevelCounts[1] };
  });
  expect(details.level).toBe(1); expect(details.category).toBe("actions"); expect(details.count).toBe(1);
  await expect(card.locator('img[alt="Sleep"]')).toHaveAttribute("src", /boy\/core-sleep\.jpg/);
  await page.reload();
  await page.getByRole("searchbox", { name: "Find a card", exact: true }).fill("sleep");
  await expect(page.getByRole("button", { name: "Add Sleep to sentence", exact: true })).toBeVisible();
  await page.evaluate(async () => { const { useCardStore } = await import("/src/store/cardStore.ts"); useCardStore.getState().setLanguage("es"); });
  await page.getByRole("searchbox").fill("dormir");
  await expect(page.getByRole("button", { name: /Dormir/ }).first()).toBeVisible();
});
