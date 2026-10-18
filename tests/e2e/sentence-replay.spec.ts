import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets } from "./helpers";

test("sentence can be spoken repeatedly without rebuilding or duplicate activity", async ({ page, context }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.addInitScript(() => {
    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: class {
      constructor(public text: string) {}
    } });
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: {
      cancel() {}, getVoices: () => [{ localService: true, lang: "en-US" }],
      speak: (utterance: SpeechSynthesisUtterance) => {
        const root = document.documentElement;
        root.dataset.spokenCount = String(Number(root.dataset.spokenCount || 0) + 1);
        setTimeout(() => utterance.onend?.(new Event("end") as SpeechSynthesisEvent), 10);
      },
    } });
  });
  await page.goto("/pecs-app");
  await page.getByRole("searchbox", { name: "Find a card" }).fill("sleep");
  await page.getByRole("button", { name: "Add Sleep to sentence", exact: true }).click();
  await context.setOffline(true);
  const speak = page.getByRole("button", { name: "Speak sentence", exact: true });
  for (let count = 1; count <= 3; count += 1) {
    await speak.click();
    await expect(page.locator("html")).toHaveAttribute("data-spoken-count", String(count));
    await expect(speak).toBeVisible();
    await expect(page.getByRole("button", { name: "Remove Sleep from sentence", exact: true })).toBeVisible();
  }
  const entries = () => page.evaluate(async () => {
    const { useCardStore } = await import("/src/store/cardStore.ts");
    return useCardStore.getState().progressEntries.length;
  });
  expect(await entries()).toBe(1);
  await page.getByRole("button", { name: /^(Finish sentence|Finish|Done)$/ }).click();
  await expect(page.getByRole("button", { name: "Remove Sleep from sentence", exact: true })).toHaveCount(0);
  expect(await entries()).toBe(1);
});
