import { expect, test } from "@playwright/test";
import { blockThirdPartyWidgets, expectNoHorizontalOverflow, seedLearner } from "./helpers";

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
  await page.getByRole("button", { name: "Skip" }).click();

  await expect(page.getByRole("heading", { name: "Expressly" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Needs & Actions" })).toBeVisible();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Let’s personalize Expressly" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Open Sam's learner profile" })).toBeVisible();
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

test("the core app fits inside the viewport", async ({ page }) => {
  await seedLearner(page);
  await page.goto("/pecs-app");
  await expect(page.getByRole("heading", { name: "Expressly" })).toBeVisible();
  await expectNoHorizontalOverflow(page);
});
