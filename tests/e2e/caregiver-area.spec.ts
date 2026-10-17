import { expect, test, type Page } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets, returnToBoard, expectNoHorizontalOverflow } from "./helpers";

const createPin = async (page: Page) => {
  await page.getByRole("button", { name: "Open caregiver area", exact: true }).click();
  await page.locator('input[type="password"]').nth(0).fill("2468");
  await page.locator('input[type="password"]').nth(1).fill("2468");
  await page.getByRole("button", { name: "Save PIN and continue", exact: true }).click();
  await expect(page.getByRole("button", { name: "Settings", exact: true })).toBeVisible();
};

test.beforeEach(async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.goto("/pecs-app");
});

test("PIN hides editing but preserves cards, alternatives, phrases and the current sentence", async ({ page }) => {
  await page.getByRole("searchbox", { name: "Find a card" }).fill("dad");
  await page.getByRole("button", { name: "Add Dad to sentence", exact: true }).click();
  await createPin(page);
  await expectNoHorizontalOverflow(page);
  await returnToBoard(page);
  await expect(page.getByRole("button", { name: "Remove Dad from sentence", exact: true })).toBeVisible();
  await expect(page.getByRole("group", { name: "Card display" })).toHaveCount(0);
  await page.getByRole("searchbox", { name: "Find a card" }).fill("dad");
  await expect(page.getByRole("button", { name: "Add Dad to favorites", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Choose another word for Dad", exact: true }).click();
  await page.getByRole("menuitem", { name: "Papa", exact: true }).click();
  await expect(page.getByRole("button", { name: "Remove Papa from sentence", exact: true })).toBeVisible();
  await page.getByRole("searchbox", { name: "Find a card" }).fill("");
  await page.getByRole("button", { name: "Saved phrases", exact: true }).click();
  await expect(page.getByRole("button", { name: "Add phrase", exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Open caregiver area", exact: true }).click();
  await expect(page.getByRole("button", { name: "Continue without a PIN", exact: true })).toHaveCount(0);
  await page.locator('input[type="password"]').fill("1111");
  await page.getByRole("button", { name: "Unlock caregiver area", exact: true }).click();
  await expect(page.getByRole("alert")).toHaveText("That PIN is incorrect.");
  await page.locator('input[type="password"]').fill("2468");
  await page.getByRole("button", { name: "Unlock caregiver area", exact: true }).click();
  await page.getByRole("button", { name: "Saved phrases", exact: true }).click();
  await expect(page.getByRole("button", { name: "Add phrase", exact: true })).toBeVisible();
});

test("protection is optional and turning it off requires unlocking and confirmation", async ({ page }) => {
  await createPin(page);
  await page.getByRole("button", { name: "Turn off PIN", exact: true }).click();
  await page.getByRole("button", { name: "Keep PIN", exact: true }).click();
  await expect(page.getByText("PIN protection on", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Turn off PIN", exact: true }).click();
  await page.getByRole("button", { name: "Turn off protection", exact: true }).click();
  await returnToBoard(page);
  await expect(page.getByRole("group", { name: "Card display" })).toBeVisible();
  await page.getByRole("button", { name: "Open caregiver area", exact: true }).click();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Settings", exact: true })).toBeVisible();
});

test("direct routes cannot bypass PIN and the caregiver session locks when backgrounded", async ({ page }) => {
  await createPin(page);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, value: true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(page.getByRole("button", { name: "Unlock caregiver area", exact: true })).toBeVisible();
  for (const route of ["/parent", "/caregiver"]) {
    await page.goto(route);
    await expect(page.getByRole("button", { name: "Unlock caregiver area", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Settings", exact: true })).toHaveCount(0);
  }
  await page.getByRole("button", { name: "Back to learner mode", exact: true }).click();
  await expect(page.getByRole("searchbox", { name: "Find a card" })).toBeVisible();
});

test("caregivers can manage favorites and saved phrases without changing the sentence", async ({ page }) => {
  await createPin(page);
  await page.getByRole("button", { name: "Manage cards", exact: true }).click();
  await page.getByRole("searchbox", { name: "Find a card to manage" }).fill("dad");
  await page.getByRole("button", { name: "Add Dad to favorites", exact: true }).click();
  await expect(page.getByRole("button", { name: "Remove Dad from favorites", exact: true })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Back", exact: true }).click();
  await page.getByRole("button", { name: "Saved phrases", exact: true }).click();
  await page.getByRole("button", { name: "Add phrase", exact: true }).click();
  await page.getByLabel("Your phrase", { exact: true }).fill("I need a break");
  await page.getByRole("button", { name: "Save phrase", exact: true }).click();
  await returnToBoard(page);
  await page.getByRole("button", { name: "Saved phrases", exact: true }).click();
  await expect(page.getByRole("button", { name: "Speak I need a break", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Add phrase", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Remove .* from sentence/ })).toHaveCount(0);
});

test("idle sessions and account-scope changes lock management", async ({ page }) => {
  await page.clock.install();
  await createPin(page);
  await page.clock.fastForward(300_001);
  await expect(page.getByRole("button", { name: "Unlock caregiver area", exact: true })).toBeVisible();
  await page.locator('input[type="password"]').fill("2468");
  await page.getByRole("button", { name: "Unlock caregiver area", exact: true }).click();
  await expect(page.getByRole("button", { name: "Settings", exact: true })).toBeVisible();
  await page.evaluate(() => {
    localStorage.removeItem("expressly-parent-pin-v1");
    localStorage.setItem("expressly-active-account-scope-v1", "guest");
    window.dispatchEvent(new Event("expressly-pin-changed"));
  });
  await expect(page.getByRole("button", { name: "Save PIN and continue", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Settings", exact: true })).toHaveCount(0);
});

test("existing Parent Mode PINs still unlock and upgrade without changing learner data", async ({ page }) => {
  await page.evaluate(async () => {
    const { hashPin } = await import("/src/lib/caregiverPin.ts");
    const salt = btoa("old-parent-pin-salt");
    localStorage.setItem("expressly-parent-pin-v1", JSON.stringify({ salt, hash: await hashPin("2468", salt, 1) }));
    window.dispatchEvent(new Event("expressly-pin-changed"));
  });
  await page.getByRole("button", { name: "Open caregiver area", exact: true }).click();
  await page.getByLabel("Parent PIN", { exact: true }).fill("2468");
  await page.getByRole("button", { name: "Unlock caregiver area", exact: true }).click();
  await expect(page.getByRole("button", { name: "Settings", exact: true })).toBeVisible();
  const stored = await page.evaluate(() => ({
    pin: JSON.parse(localStorage.getItem("expressly-parent-pin-v1")!),
    name: JSON.parse(localStorage.getItem("pecs-storage")!).state.userName,
  }));
  expect(stored.pin.version).toBe(2);
  expect(stored.pin.hash).not.toBe("2468");
  expect(stored.name).toBe("Test Learner");
});
