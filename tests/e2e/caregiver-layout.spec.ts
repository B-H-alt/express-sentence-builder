import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets, expectNoHorizontalOverflow } from "./helpers";

test("caregiver overview groups tools and reflects saved preferences", async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.goto("/caregiver");
  await page.getByRole("button", { name: "Continue without a PIN", exact: true }).click();
  const learner = page.getByRole("region", { name: "Current learner" });
  await expect(learner).toContainText("Test Learner");
  await expect(learner).toContainText("Level 1");
  await expect(learner).toContainText("Off");
  await expect(page.getByRole("region", { name: "Your board", exact: true }).getByRole("button", { name: "Settings", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Activity & devices", exact: true }).getByRole("button", { name: "Connected devices", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Account & support", exact: true }).getByRole("button", { name: "Account", exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("tab", { name: "Vocabulary", exact: true }).click();
  await page.getByRole("button", { name: /Level 4 \(Explore\)/ }).click();
  await page.getByRole("button", { name: "Save level", exact: true }).click();
  await page.getByRole("button", { name: "Close settings", exact: true }).click();
  await expect(learner).toContainText("Level 4");
  await page.getByRole("button", { name: "Manage cards", exact: true }).click();
  await expect(page.getByRole("searchbox", { name: "Find a card to manage" })).toBeVisible();
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Return to board", exact: true }).click();
  await expect(page.getByRole("searchbox", { name: "Find a card", exact: true })).toBeVisible();
});

test("caregiver back navigation stays visible after scrolling each subpage", async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.goto("/caregiver");
  await page.getByRole("button", { name: "Continue without a PIN", exact: true }).click();
  for (const destination of ["Manage cards", "Saved phrases", "Connected devices", "Parent dashboard"]) {
    await page.getByRole("button", { name: destination, exact: true }).click();
    if (destination === "Saved phrases") {
      await expect(page.getByRole("button", { name: "Home", exact: true })).toHaveCount(0);
    }
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const back = page.locator("header").getByRole("button", { name: "Caregiver area", exact: true });
    await expect(back).toBeInViewport();
    await expectNoHorizontalOverflow(page);
    await back.click();
    await expect(page.getByRole("heading", { name: "Caregiver area", exact: true })).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
  }
});
