import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets, openSettings } from "./helpers";

test("a failed page module shows a retry screen and preserves saved data", async ({ page }) => {
  await seedLearner(page); await blockThirdPartyWidgets(page);
  await page.route("**/src/pages/Index.tsx*", route => route.abort("failed"));
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Let’s try opening that again." })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("pecs-storage")!).state.userName)).toBe("Test Learner");
  await page.unroute("**/src/pages/Index.tsx*");
  await page.getByRole("button", { name: "Retry opening Expressly", exact: true }).click();
  await expect(page.getByRole("heading", { name: "More ways to say what’s on your mind." })).toBeVisible();
});

test("the dismissed release welcome can be reopened without restarting the one-time announcement", async ({ page }) => {
  await seedLearner(page); await blockThirdPartyWidgets(page);
  await page.goto("/pecs-app"); await openSettings(page);
  await page.getByRole("button", { name: "Close settings", exact: true }).click();
  for (let i = 0; i < 2; i++) {
    await page.getByRole("button", { name: "What’s new", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Expressly, refreshed." })).toBeVisible();
    await page.getByRole("button", { name: "Not now", exact: true }).click();
  }
  await page.getByRole("button", { name: "Return to board", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Expressly, refreshed." })).toHaveCount(0);
});
