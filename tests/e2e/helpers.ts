import { expect, type Page } from "@playwright/test";

export const seedLearner = async (page: Page) => {
  await page.addInitScript(() => {
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
  });
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
