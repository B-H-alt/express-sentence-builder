import { expect, test } from "@playwright/test";
import { blockThirdPartyWidgets, expectNoHorizontalOverflow, seedLearner } from "./helpers";

test.beforeEach(async ({ page }) => {
  await blockThirdPartyWidgets(page);
  await seedLearner(page);
  await page.goto("/pecs-app");
});

test("the complete communication flow remains usable on iPad", async ({ page }) => {
  await expect(page.locator("html")).toHaveAttribute("data-device", "tablet");
  await expect(page.getByRole("heading", { name: "Expressly" })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("button", { name: "People" }).click();
  const momCard = page.getByRole("button", { name: "Add Mom to sentence" });
  await expect(momCard).toBeVisible();
  await momCard.click();

  await expect(page.getByRole("button", { name: "Remove Mom from sentence" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Finish|Done/ })).toBeVisible();

  await page.getByRole("button", { name: "Open Test Learner's learner profile" }).click();
  await page.getByRole("menuitem", { name: "Profile & settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await page.getByRole("button", { name: "Close settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
});
