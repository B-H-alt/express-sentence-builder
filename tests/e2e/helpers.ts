import { expect, type Page } from "@playwright/test";

export const seedLearner = async (page: Page, options: { showReleaseWelcome?: boolean } = {}) => {
  await page.addInitScript(({ showReleaseWelcome }) => {
    if (!showReleaseWelcome) window.localStorage.setItem("expressly-release-welcome-v1", "expressly-refresh-2026-10");
    window.localStorage.setItem("expressly-guide-seen", "true");
    window.localStorage.setItem(
      "pecs-storage",
      JSON.stringify({
        state: {
          onboardingComplete: true,
          userName: "Test Learner",
          userImage: null,
          characterGender: "girl",
          currentLevel: 1,
          showWords: true,
          language: "en",
        },
        version: 15,
      }),
    );
  }, options);
};

export const expectNoHorizontalOverflow = async (page: Page) => {
  await page.waitForTimeout(750);
  const dimensions = await page.evaluate(() => ({
    viewport: document.documentElement.clientWidth,
    content: document.documentElement.scrollWidth,
  }));
  expect(dimensions.content).toBeLessThanOrEqual(dimensions.viewport + 1);
};

export const blockThirdPartyWidgets = async (page: Page) => {
  await page.route("https://challenges.cloudflare.com/**", (route) => route.abort());
};

export const openSettings = async (page: Page) => {
  const entry = page.getByRole("button", { name: "Open caregiver area", exact: true });
  if (new URL(page.url()).pathname === "/pecs-app") await entry.click();
  const skipPin = page.getByRole("button", { name: "Continue without a PIN", exact: true });
  await Promise.race([
    skipPin.waitFor({ state: "visible" }),
    page.getByRole("button", { name: "Settings", exact: true }).waitFor({ state: "visible" }),
  ]);
  if (await skipPin.isVisible()) await skipPin.click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
};

export const returnToBoard = async (page: Page) => {
  await page.getByRole("button", { name: "Return to board", exact: true }).click();
  await page.getByRole("searchbox", { name: "Find a card" }).waitFor();
};
