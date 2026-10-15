import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets } from "./helpers";

test("Speak now uses enhanced voice, reuses clips, and falls back on failure", async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  const user = { id: "11111111-1111-4111-8111-111111111111", aud: "authenticated", role: "authenticated", email: "test@example.com", email_confirmed_at: new Date().toISOString(), app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 })}.test-signature`;
  await page.route("**/auth/v1/**", (route) => route.fulfill({ json: route.request().url().includes("/token") ? { access_token: token, refresh_token: "test-refresh", token_type: "bearer", expires_in: 3600, user } : { user, ...user } }));
  // Mock playback completely: no audible sound and no provider credits.
  await page.addInitScript(() => {
    Object.defineProperty(window, "Audio", { value: class extends EventTarget {
      ended = false;
      play() {
        document.documentElement.dataset.testAudioStarts = String(Number(document.documentElement.dataset.testAudioStarts || 0) + 1);
        setTimeout(() => { this.ended = true; this.dispatchEvent(new Event("ended")); }, 10);
        return Promise.resolve();
      }
      pause() { this.dispatchEvent(new Event("pause")); }
    } });
    Object.defineProperty(window, "speechSynthesis", { value: { cancel() {}, getVoices: () => [], speak: (utterance: SpeechSynthesisUtterance) => setTimeout(() => utterance.onend?.(new Event("end") as SpeechSynthesisEvent), 10) } });
  });
  const requests: string[] = [];
  await page.route("**/api/speak", (route) => {
    const text = route.request().postDataJSON().text;
    requests.push(text);
    return route.fulfill(text === "No" ? { status: 502, json: { error: "Unavailable" } } : { contentType: "audio/mpeg", body: "mock-audio" });
  });
  await page.goto("/");
  const mobile = (page.viewportSize()?.width ?? 1280) < 768;
  if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page.getByRole("button", { name: mobile ? "Sign in to your account" : "Sign in", exact: true }).click();
  await page.getByPlaceholder("parent@example.com").fill("test@example.com");
  await page.getByPlaceholder("Password", { exact: true }).fill("Test-password-123!");
  await page.getByRole("dialog").getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/pecs-app/);
  await page.getByRole("button", { name: "Speak Yes", exact: true }).click();
  await expect.poll(() => requests.length).toBe(1);
  await page.getByRole("button", { name: "Speak Yes", exact: true }).click();
  await page.getByRole("button", { name: "Speak No", exact: true }).click();
  await expect(page.getByText("Using device voice", { exact: true })).toBeVisible();
  expect(requests).toEqual(["Yes", "No"]);

  // Hold one response while a newer phrase wins. Releasing stale audio must not play it.
  let releaseOld: () => void = () => {};
  const oldResponse = new Promise<void>((resolve) => { releaseOld = resolve; });
  await page.route("**/api/speak", async (route) => {
    if (route.request().postDataJSON().text === "More") await oldResponse;
    await route.fulfill({ contentType: "audio/mpeg", body: "mock-audio" }).catch(() => {});
  });
  const before = Number(await page.locator("html").getAttribute("data-test-audio-starts"));
  await Promise.all([
    page.waitForRequest((request) => request.url().endsWith("/api/speak") && request.postDataJSON().text === "More"),
    page.getByRole("button", { name: "Speak More", exact: true }).click(),
  ]);
  await page.getByRole("button", { name: "Speak Stop", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-test-audio-starts", String(before + 1));
  releaseOld();
  await page.getByRole("button", { name: "Speak All done", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("data-test-audio-starts", String(before + 2));
});

for (const offline of [false, true]) {
  test(`Speak now keeps device speech available ${offline ? "offline" : "when signed out"}`, async ({ page, context }) => {
    await seedLearner(page);
    await blockThirdPartyWidgets(page);
    await page.addInitScript(() => {
      Object.defineProperty(window, "SpeechSynthesisUtterance", { configurable: true, value: class {
        constructor(public text: string) {}
        voice = null;
      } });
      Object.defineProperty(window, "speechSynthesis", { configurable: true, value: {
        cancel() {},
        getVoices: () => [{ localService: true, lang: "en-US" }],
        speak: (utterance: SpeechSynthesisUtterance) => {
          document.documentElement.dataset.testSpokenPhrase = utterance.text;
          setTimeout(() => utterance.onend?.(new Event("end") as SpeechSynthesisEvent), 10);
        },
      } });
    });
    const requests: string[] = [];
    page.on("request", (request) => { if (request.url().includes("/api/speak")) requests.push(request.url()); });
    await page.goto("/pecs-app");
    await page.getByRole("button", { name: "Speak Yes", exact: true }).waitFor();
    if (offline) await context.setOffline(true);
    await page.getByRole("button", { name: "Speak Yes", exact: true }).click();
    await expect(page.locator("html")).toHaveAttribute("data-test-spoken-phrase", "Yes");
    expect(requests).toEqual([]);
  });
}
