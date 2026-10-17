import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets, expectNoHorizontalOverflow } from "./helpers";

const native = async (page: import("@playwright/test").Page) => {
  // Simulate Capacitor's documented custom-platform bridge, without native plugins.
  await page.addInitScript(() => { (window as unknown as { CapacitorCustomPlatform: { name: string } }).CapacitorCustomPlatform = { name: "ios" }; });
  await blockThirdPartyWidgets(page);
};

test("native welcome shows once, preserves the board and skips it on reopen", async ({ page }) => {
  await native(page); await seedLearner(page); await page.goto("/");
  await expect(page.getByText("Communicate with pictures.", { exact: true })).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.getByRole("button", { name: "How to use Expressly", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("Tap cards to build a sentence.", { exact: true })).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Open Expressly", exact: true }).click();
  await expect(page.getByRole("searchbox", { name: "Find a card" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("expressly-welcome-seen-v1"))).toBe("true");
  await expect(page.getByRole("button", { name: "Open caregiver area", exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole("searchbox", { name: "Find a card" })).toBeVisible();
  await expect(page.getByText("Communicate with pictures.", { exact: true })).toHaveCount(0);
});

test("new learner can enter without an account and use existing quick setup", async ({ page }) => {
  await native(page); await page.goto("/");
  await page.getByRole("button", { name: "Open Expressly", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Let’s personalize Expressly" })).toBeVisible();
});

test("welcome sign-in opens account dialog and does not reappear", async ({ page }) => {
  await native(page); await seedLearner(page); await page.goto("/");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sign in to Expressly", exact: true })).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Close", exact: true }).click();
  await page.goto("/");
  await expect(page.getByRole("searchbox", { name: "Find a card" })).toBeVisible();
});

test("account callback skips welcome while ordinary website remains unchanged", async ({ page }) => {
  await native(page); await seedLearner(page); await page.goto("/pecs-app?account=sign-in");
  await expect(page.getByRole("heading", { name: "Sign in to Expressly", exact: true })).toBeVisible();
  await expect(page.getByText("Communicate with pictures.", { exact: true })).toHaveCount(0);
  await page.getByRole("dialog").getByRole("button", { name: "Close", exact: true }).click();
  await expect(page.getByRole("searchbox", { name: "Find a card" })).toBeVisible();
});
