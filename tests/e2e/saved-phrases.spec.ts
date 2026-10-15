import { expect, test } from "@playwright/test";
import { blockThirdPartyWidgets, expectNoHorizontalOverflow } from "./helpers";

test.beforeEach(async ({ page }) => {
  await blockThirdPartyWidgets(page);
  await page.addInitScript(() => {
    if (!localStorage.getItem("pecs-storage")) {
      localStorage.setItem("expressly-guide-seen", "true");
      localStorage.setItem("pecs-storage", JSON.stringify({ version: 15, state: { onboardingComplete: true, userName: "Test", currentLevel: 1, language: "en", showWords: true } }));
    }
    Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: class { constructor(public text: string) {} voice = null; } });
    Object.defineProperty(window, "speechSynthesis", { configurable: true, value: {
      cancel() {}, getVoices: () => [{ localService: true, lang: "en-US" }],
      speak: (utterance: SpeechSynthesisUtterance) => {
        document.documentElement.dataset.spokenPhrase = utterance.text;
        setTimeout(() => utterance.onend?.(new Event("end") as SpeechSynthesisEvent), 10);
      },
    } });
  });
  await page.goto("/pecs-app");
  await page.getByRole("button", { name: "Saved phrases", exact: true }).click();
});

test("save, reload, speak offline, and remove a phrase without touching the sentence", async ({ page, context }) => {
  await expect(page.getByText("Keep something you say often.")).toBeVisible();
  await page.getByRole("button", { name: "Add phrase", exact: true }).click();
  await page.getByRole("textbox", { name: "Your phrase", exact: true }).fill("I need a break.");
  await page.getByRole("button", { name: "Save phrase", exact: true }).click();
  const phrase = page.getByRole("button", { name: "Speak I need a break.", exact: true });
  await expect(phrase).toBeVisible();
  await expect(page.getByRole("button", { name: "Remove I need a break.", exact: true })).toHaveCount(0);
  await page.reload();
  await page.getByRole("button", { name: "Saved phrases", exact: true }).click();
  await phrase.waitFor();
  await context.setOffline(true);
  await phrase.click();
  await expect(page.locator("html")).toHaveAttribute("data-spoken-phrase", "I need a break.");
  await expectNoHorizontalOverflow(page);
  await page.getByRole("button", { name: "Manage", exact: true }).click();
  await page.getByRole("button", { name: "Remove I need a break.", exact: true }).click();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.getByText("I need a break.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Remove I need a break.", exact: true }).click();
  await page.getByRole("button", { name: "Remove phrase", exact: true }).click();
  await expect(page.getByText("Keep something you say often.")).toBeVisible();
});

test("current cards prefill a phrase and duplicate saves are explained", async ({ page }) => {
  await page.getByRole("button", { name: "People", exact: true }).click();
  await page.getByRole("button", { name: "Add Mom to sentence", exact: true }).click();
  await page.getByRole("button", { name: "Saved phrases", exact: true }).click();
  await page.getByRole("button", { name: "Add phrase", exact: true }).click();
  await expect(page.getByRole("textbox", { name: "Your phrase", exact: true })).toHaveValue("Mom");
  await page.getByRole("button", { name: "Save phrase", exact: true }).click();
  await expect(page.getByRole("button", { name: "Remove Mom from sentence", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Add phrase", exact: true }).click();
  await page.getByRole("button", { name: "Save phrase", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("already saved");
});
