import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets } from "./helpers";

for (const speechWorks of [true, false]) {
  test(`offline device speech ${speechWorks ? "completes" : "fails without losing cards"}`, async ({ page, context }) => {
    await blockThirdPartyWidgets(page);
    await seedLearner(page);
    // No actual audio or paid requests. Exercise only the device speech events.
    await page.addInitScript((works) => {
      Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: class {
        constructor(public text: string) {}
        voice = null;
      } });
      Object.defineProperty(window, "speechSynthesis", { configurable: true, value: {
        getVoices: () => [{ localService: true, lang: "en-US" }],
        cancel: () => {}, speaking: false,
        speak: (utterance: SpeechSynthesisUtterance) => {
          setTimeout(() => {
            if (works) utterance.onend?.(new Event("end") as SpeechSynthesisEvent);
            else utterance.onerror?.(new Event("error") as SpeechSynthesisErrorEvent);
          }, 10);
        },
      } });
    }, speechWorks);
    await page.goto("/pecs-app");
    await page.getByRole("searchbox", { name: "Find a card" }).fill("eat");
    await page.getByRole("button", { name: "Add Eat to sentence", exact: true }).click();
    const apiRequests: string[] = [];
    page.on("request", (request) => { if (request.url().includes("/api/")) apiRequests.push(request.url()); });
    await context.setOffline(true);
    await page.getByRole("button", { name: "Speak", exact: true }).click();
    if (speechWorks) {
      await expect(page.getByRole("button", { name: "Remove Eat from sentence" })).toHaveCount(0);
    } else {
      await expect(page.getByText("Speech couldn't play", { exact: true })).toBeVisible();
      await expect(page.getByRole("button", { name: "Remove Eat from sentence" })).toBeVisible();
    }
    expect(apiRequests).toEqual([]);
    await context.setOffline(false);
  });
}
