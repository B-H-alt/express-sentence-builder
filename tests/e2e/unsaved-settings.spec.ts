import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets, openSettings, returnToBoard } from "./helpers";

test("all settings exits guard drafts, keep editing preserves them, and save applies both sections", async ({ page }) => {
  await seedLearner(page); await blockThirdPartyWidgets(page); await page.goto("/pecs-app");
  await openSettings(page);
  await page.getByLabel("Name", { exact: true }).fill("New name");
  await page.getByRole("tab", { name: "Display", exact: true }).click();
  await page.getByRole("button", { name: /Level 4 \(Explore\)/ }).click();
  for (const exit of ["x", "close", "escape", "outside"]) {
    if (exit === "x") await page.getByRole("button", { name: "Close settings", exact: true }).click();
    if (exit === "close") await page.getByRole("button", { name: "Close", exact: true }).click();
    if (exit === "escape") await page.keyboard.press("Escape");
    if (exit === "outside") await page.mouse.click(2, 2);
    await expect(page.getByRole("alertdialog")).toBeVisible();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("pecs-storage")!).state);
    expect(saved.currentLevel).toBe(1); expect(saved.userName).toBe("Test Learner");
    if (exit === "escape") await page.keyboard.press("Escape");
    else await page.getByRole("button", { name: "Keep editing", exact: true }).click();
    await expect(page.getByRole("alertdialog"), exit).toHaveCount(0);
    await expect(page.getByRole("button", { name: /Level 4 \(Explore\)/ })).toHaveAttribute("aria-pressed", "true");
  }
  await page.getByRole("button", { name: "Close settings", exact: true }).click();
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Settings", exact: true })).toHaveCount(0);
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem("pecs-storage")!).state);
  expect(saved.currentLevel).toBe(4); expect(saved.userName).toBe("New name");
});

test("custom cards warn before discarding and save from the warning without closing settings", async ({ page }) => {
  await seedLearner(page); await blockThirdPartyWidgets(page); await page.goto("/pecs-app");
  await openSettings(page);
  await page.getByRole("tab", { name: "Cards & voice", exact: true }).click();
  await page.getByRole("button", { name: "Add a card", exact: true }).click();
  const label = page.getByPlaceholder(/e.g./).first();
  await label.fill("My custom word");
  await page.getByRole("button", { name: "Close card editor", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();
  await page.getByRole("button", { name: "Keep editing", exact: true }).click();
  await expect(label).toHaveValue("My custom word");
  await page.keyboard.press("Escape");
  await page.getByRole("button", { name: "Save changes", exact: true }).click();
  await expect(page.getByRole("dialog", { name: "Settings", exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem("pecs-storage")!).state.customCards.some((card: { text: string }) => card.text === "My custom word"))).toBe(true);
  await page.getByRole("button", { name: "Close settings", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
});
