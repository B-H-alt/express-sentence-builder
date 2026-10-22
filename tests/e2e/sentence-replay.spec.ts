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

test("enhanced sentence replay reuses corrected text and audio without another provider request", async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  const user = { id: "11111111-1111-4111-8111-111111111111", aud: "authenticated", role: "authenticated", email: "test@example.com", app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 })}.test-signature`;
  await page.route("**/auth/v1/**", route => route.fulfill({ json: route.request().url().includes("/token")
    ? { access_token: token, refresh_token: "test-refresh", token_type: "bearer", expires_in: 3600, user }
    : user }));
  await page.addInitScript(() => {
    Object.defineProperty(window, "Audio", { value: class extends EventTarget {
      ended = false;
      play() {
        this.ended = false;
        document.documentElement.dataset.sentenceAudioStarts = String(Number(document.documentElement.dataset.sentenceAudioStarts || 0) + 1);
        setTimeout(() => { this.ended = true; this.dispatchEvent(new Event("ended")); }, 10);
        return Promise.resolve();
      }
      pause() { this.dispatchEvent(new Event("pause")); }
    } });
  });
  let grammarRequests = 0;
  let voiceRequests = 0;
  await page.route("**/api/compose", route => { grammarRequests++; return route.fulfill({ json: { sentence: "I am sleeping." } }); });
  await page.route("**/api/speak", route => {
    voiceRequests++;
    expect(route.request().postDataJSON().text).toBe("I am sleeping.");
    return route.fulfill({ contentType: "audio/mpeg", body: "test-voice" });
  });
  await page.goto("/pecs-app?account=sign-in");
  await page.getByPlaceholder("parent@example.com").fill("test@example.com");
  await page.getByPlaceholder("Password", { exact: true }).fill("Test-password-123!");
  await page.getByRole("dialog").getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByRole("searchbox", { name: "Find a card" }).fill("sleep");
  await page.getByRole("button", { name: "Add Sleep to sentence", exact: true }).click();
  for (let count = 1; count <= 3; count++) {
    await page.getByRole("button", { name: "Speak sentence", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-sentence-audio-starts", String(count));
    await expect(page.getByRole("button", { name: "Speak sentence", exact: true })).toBeVisible();
  }
  expect(grammarRequests).toBe(1);
  expect(voiceRequests).toBe(1);
  expect(await page.evaluate(async () => (await import("/src/store/cardStore.ts")).useCardStore.getState().progressEntries.length)).toBe(1);
});
