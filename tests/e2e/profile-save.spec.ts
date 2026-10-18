import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets, openSettings } from "./helpers";

test("profile save confirms inline, stays open and preserves unsaved level changes", async ({ page }) => {
  await seedLearner(page); await blockThirdPartyWidgets(page);
  await page.goto("/pecs-app"); await openSettings(page);
  await page.getByLabel("Name", { exact: true }).fill("Sam");
  await page.getByRole("tab", { name: "Vocabulary", exact: true }).click();
  await page.getByRole("button", { name: /Level 4 \(Explore\)/ }).click();
  await page.getByRole("tab", { name: "Profile", exact: true }).click();
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Settings", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Saved", exact: true })).toBeDisabled();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("pecs-storage")!).state);
  expect(saved.userName).toBe("Sam"); expect(saved.currentLevel).toBe(1);
  await page.getByLabel("Name", { exact: true }).fill("Sammy");
  await expect(page.getByRole("button", { name: "Save profile", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await page.getByRole("button", { name: "Close settings", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Keep editing", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Settings", exact: true })).toBeVisible();
});
