import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets, expectNoHorizontalOverflow, openSettings } from "./helpers";

for (const dismiss of ["Explore Expressly", "Not now", "Escape"]) {
  test(`refresh welcome appears once and stays dismissed with ${dismiss}`, async ({ page }) => {
    await seedLearner(page, { showReleaseWelcome: true });
    await blockThirdPartyWidgets(page);
    await page.goto("/pecs-app");
    const dialog = page.getByRole("dialog", { name: "Expressly, refreshed." });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("Five levels");
    if (dismiss === "Escape") await page.keyboard.press("Escape");
    else await dialog.getByRole("button", { name: dismiss, exact: true }).click();
    await expect(dialog).toHaveCount(0);
    await page.reload();
    await expect(page.getByRole("searchbox", { name: "Find a card", exact: true })).toBeVisible();
    await expect(dialog).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("expressly-release-welcome-v1"))).toBe("expressly-refresh-2026-10");
  });
}

for (const theme of ["Lavender", "Rose"]) {
  test(`onboarding includes ${theme} and persists its theme`, async ({ page }) => {
    await blockThirdPartyWidgets(page);
    await page.goto("/pecs-app");
    await page.getByPlaceholder("What should we call you?").fill("Sam");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await page.getByRole("button", { name: theme, exact: true }).click();
    await expectNoHorizontalOverflow(page);
    await page.getByRole("button", { name: "Start using Expressly", exact: true }).click();
    await expect(page.getByRole("dialog", { name: "Expressly, refreshed." })).toBeVisible();
    await expect(page.getByRole("button", { name: "Skip", exact: true })).toHaveCount(0);
    await page.getByRole("button", { name: "Explore Expressly", exact: true }).click();
    await page.getByRole("button", { name: "Skip", exact: true }).click();
    await expect(page.locator("html")).toHaveClass(new RegExp(theme.toLowerCase()));
    await expect(page.getByRole("dialog", { name: "Expressly, refreshed." })).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem("expressly-theme"))).toBe(theme.toLowerCase());
    await page.reload();
    await expect(page.getByRole("searchbox", { name: "Find a card", exact: true })).toBeVisible();
    await expect(page.getByRole("dialog", { name: "Expressly, refreshed." })).toHaveCount(0);
  });
}

test("settings use larger readable text without horizontal overflow", async ({ page }) => {
  await seedLearner(page); await blockThirdPartyWidgets(page);
  await page.goto("/pecs-app"); await openSettings(page);
  const panel = page.getByRole("dialog", { name: "Settings", exact: true });
  expect(await panel.locator(".text-sm").first().evaluate(el => getComputedStyle(el).fontSize)).toBe("16px");
  await expect(panel).toBeInViewport();
  await expectNoHorizontalOverflow(page);
  await page.getByRole("tab", { name: "Vocabulary", exact: true }).click();
  await page.getByRole("button", { name: "Save level", exact: true }).scrollIntoViewIfNeeded();
  await expect(page.getByRole("button", { name: "Save level", exact: true })).toBeInViewport();
});

test("returning users see the welcome before an unseen tutorial", async ({ page }) => {
  await seedLearner(page, { showReleaseWelcome: true });
  await blockThirdPartyWidgets(page);
  await page.addInitScript(() => localStorage.removeItem("expressly-guide-seen"));
  await page.goto("/pecs-app");
  await expect(page.getByRole("dialog", { name: "Expressly, refreshed." })).toBeVisible();
  await expect(page.getByRole("button", { name: "Skip", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Not now", exact: true }).click();
  await expect(page.getByRole("button", { name: "Skip", exact: true })).toBeVisible();
});
