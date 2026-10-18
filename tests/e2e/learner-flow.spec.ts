import { expect, test } from "@playwright/test";
import { blockThirdPartyWidgets, expectNoHorizontalOverflow, seedLearner, openSettings, returnToBoard } from "./helpers";

test.beforeEach(async ({ page }) => {
  await blockThirdPartyWidgets(page);
});

test("a new learner can finish the short onboarding", async ({ page }) => {
  await page.goto("/pecs-app");
  await page.getByPlaceholder("What should we call you?").fill("Sam");
  await page.getByRole("button", { name: "Boy" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Warm" }).click();
  await page.getByRole("button", { name: "Start using Expressly" }).click();
  await page.getByRole("button", { name: "Explore Expressly", exact: true }).click();
  await page.getByRole("button", { name: "Skip" }).click();

  await expect(page.getByRole("heading", { name: "Expressly" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Needs & Actions" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Let’s personalize Expressly" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open caregiver area" })).toBeVisible();
});

test("a learner can find a card, add it, and clear the sentence", async ({ page }) => {
  await seedLearner(page);
  await page.goto("/pecs-app");

  const search = page.getByRole("searchbox", { name: "Find a card" });
  await search.fill("eat");
  await expect(page.getByAltText("Eat")).toBeVisible();
  await page.getByAltText("Eat").click();

  await expect(page.getByRole("button", { name: /Finish|Done/ })).toBeVisible();
  await expect(page.getByRole("button", { name: "Clear sentence" })).toBeVisible();
  await page.getByRole("button", { name: "Clear sentence" }).click();
  await expect(page.getByRole("button", { name: "Clear sentence" })).toHaveCount(0);
});

test("choosing an alternative adds only the selected word", async ({ page }) => {
  await seedLearner(page);
  await page.goto("/pecs-app");
  await page.getByRole("searchbox", { name: "Find a card" }).fill("dad");
  await page.getByRole("button", { name: "Choose another word for Dad" }).click();
  await page.getByRole("menuitem", { name: "Papa", exact: true }).click();
  await expect(page.getByRole("button", { name: "Remove Papa from sentence" })).toHaveCount(1);
  await expect(page.getByRole("button", { name: "Remove Dad from sentence" })).toHaveCount(0);
});

test("the signed-out parent account screen exposes the expected safe paths", async ({ page }) => {
  await seedLearner(page);
  await page.goto("/pecs-app?account=sign-in");

  await expect(page.getByRole("heading", { name: "Sign in to Expressly" })).toBeVisible();
  await expect(page.getByPlaceholder("parent@example.com")).toBeVisible();
  await expect(page.getByPlaceholder("Password")).toBeVisible();
  await expect(page.getByRole("button", { name: "Forgot password?" })).toBeVisible();

  await page.getByRole("button", { name: "Sign up" }).click();
  await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
  await expect(page.getByText("I agree to the")).toBeVisible();
  await expect(page.getByRole("link", { name: "Terms of Use" })).toHaveAttribute("href", "/terms");
  await expect(page.getByRole("link", { name: "Privacy Policy" })).toHaveAttribute("href", "/privacy");
});

test("calm mode removes secondary card controls without blocking communication", async ({ page }) => {
  await seedLearner(page);
  await page.goto("/pecs-app");

  await openSettings(page);
  await page.getByRole("tab", { name: "Display" }).click();
  await page.getByRole("switch", { name: "Calm mode" }).click();
  await page.getByRole("button", { name: "Close settings" }).click();
  await returnToBoard(page);

  await page.getByRole("searchbox", { name: "Find a card" }).fill("eat");
  const eatCard = page.getByRole("button", { name: "Add Eat to sentence" });
  await expect(eatCard).toBeVisible();
  await expect(page.getByRole("button", { name: "Add Eat to favorites" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Choose another word for Eat" })).toHaveCount(0);

  await eatCard.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Remove Eat from sentence" })).toBeVisible();
});
test("the core app fits inside the viewport", async ({ page }) => {
  await seedLearner(page);
  await page.goto("/pecs-app");
  await expect(page.getByRole("heading", { name: "Expressly" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
