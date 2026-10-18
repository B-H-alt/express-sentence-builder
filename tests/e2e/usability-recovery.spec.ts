import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets, openSettings, expectNoHorizontalOverflow } from "./helpers";

test.beforeEach(async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.addInitScript(() => {
    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: class { constructor(public text: string) {} } });
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: {
      cancel() {}, getVoices: () => [{ localService: true, lang: "en-US" }],
      // Deliberately silent engine: no audio and no start/end/error callbacks.
      speak() { document.documentElement.dataset.speechCalls = String(Number(document.documentElement.dataset.speechCalls || 0) + 1); },
    } });
  });
});

test("a searched card adds once, dismisses search focus and exposes sentence speech", async ({ page }, info) => {
  await page.goto("/pecs-app");
  const search = page.getByRole("searchbox", { name: "Find a card" });
  await search.fill("sleep");
  const card = page.getByRole("button", { name: "Add Sleep to sentence", exact: true });
  if (info.project.name === "mobile") {
    await page.evaluate(() => { document.documentElement.dataset.keyboard = "open"; });
    await card.tap();
  } else await card.click();
  await expect(page.getByRole("button", { name: "Remove Sleep from sentence", exact: true })).toHaveCount(1);
  await expect(search).not.toBeFocused();
  await expect(page.getByRole("button", { name: "Speak sentence", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Speak now", exact: true })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  await expect(page.getByRole("button", { name: "Open caregiver area", exact: true })).toBeInViewport({ ratio: 1 });
});

test("caregiver entry fits a narrow phone and all settings sections remain reachable", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/pecs-app");
  await expect(page.getByRole("button", { name: "Open caregiver area", exact: true })).toBeInViewport({ ratio: 1 });
  await openSettings(page);
  for (const name of ["Profile", "Vocabulary", "Display", "Cards & voice", "Accessibility"]) {
    await expect(page.getByRole("tab", { name, exact: true })).toBeInViewport({ ratio: 1 });
  }
});

test("an unresponsive device voice restores Speak without losing the message", async ({ page, context }) => {
  await page.goto("/pecs-app");
  await page.getByRole("searchbox", { name: "Find a card" }).fill("sleep");
  await page.getByRole("button", { name: "Add Sleep to sentence", exact: true }).click();
  await context.setOffline(true);
  await page.clock.install();
  await page.getByRole("button", { name: "Speak sentence", exact: true }).click();
  await expect(page.getByRole("button", { name: "Stop", exact: true })).toBeVisible();
  await page.clock.fastForward(8_100);
  await expect(page.getByText("Speech couldn't play", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Speak sentence", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove Sleep from sentence", exact: true })).toBeVisible();
});

test("voice test is manual, identifies muted app volume and does not hide settings sections", async ({ page }) => {
  await page.goto("/pecs-app");
  await openSettings(page);
  for (const label of ["Profile", "Vocabulary", "Display", "Cards & voice", "Accessibility"]) {
    await expect(page.getByRole("tab", { name: label, exact: true })).toBeInViewport();
  }
  await page.getByRole("tab", { name: "Cards & voice", exact: true }).click();
  await expect(page.getByRole("button", { name: "Test device voice", exact: true })).toBeVisible();
  await expect(page.locator("html")).not.toHaveAttribute("data-speech-calls");
  await page.evaluate(async () => {
    const { useCardStore } = await import("/src/store/cardStore.ts"); useCardStore.getState().setSpeechVolume(0);
  });
  await page.getByRole("button", { name: "Test device voice", exact: true }).click();
  await expect(page.getByRole("status").filter({ hasText: "Expressly volume is muted" })).toBeVisible();
  await expect(page.locator("html")).not.toHaveAttribute("data-speech-calls");
});

test("caregiver tour is skippable, remembered and available again on request", async ({ page }) => {
  await page.goto("/caregiver");
  await page.getByRole("button", { name: "Continue without a PIN", exact: true }).click();
  const tour = page.getByRole("region", { name: "Caregiver quick tour", exact: true });
  await expect(tour).toBeVisible();
  await tour.getByRole("button", { name: "Next", exact: true }).click();
  await tour.getByRole("button", { name: "Next", exact: true }).click();
  await expect(tour.getByText(/Phone Settings change this phone/)).toBeVisible();
  await tour.getByRole("button", { name: "Done", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("button", { name: "Settings", exact: true })).toBeVisible();
  await expect(tour).toHaveCount(0);
  await page.getByRole("button", { name: "Quick tour", exact: true }).click();
  await expect(tour).toBeVisible();
  await tour.getByRole("button", { name: "Skip tour", exact: true }).click();
  await expect(tour).toHaveCount(0);
});

test("website has a direct caregiver path", async ({ page }, info) => {
  await page.goto("/");
  if (info.project.name === "mobile") await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page.getByRole("link", { name: info.project.name === "mobile" ? "Caregiver area" : "Caregiver", exact: true }).click();
  await expect(page).toHaveURL(/\/caregiver$/);
});
