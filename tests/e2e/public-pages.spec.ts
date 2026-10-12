import { expect, test } from "@playwright/test";
import { blockThirdPartyWidgets, expectNoHorizontalOverflow } from "./helpers";

test.beforeEach(async ({ page }) => {
  await blockThirdPartyWidgets(page);
});

test("landing page opens the communication app", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("Expressly | Communication Made Simple");
  await expect(page.getByRole("heading", { name: "Say what you mean, one picture at a time." })).toBeVisible();
  await expectNoHorizontalOverflow(page);

  await page.getByRole("link", { name: "Open Expressly" }).first().click();
  await expect(page).toHaveURL(/\/pecs-app$/);
  await expect(page.getByRole("heading", { name: "Let’s personalize Expressly" })).toBeVisible();
});

test("public information pages load and remain usable", async ({ page }) => {
  const pages = [
    { path: "/about", heading: "Communication should not fail when it matters most." },
    { path: "/privacy", heading: "Privacy Policy" },
    { path: "/terms", heading: "Terms of Use" },
    { path: "/pricing", heading: "Choose the support that fits." },
  ];

  for (const item of pages) {
    await page.goto(item.path);
    await expect(page.getByRole("heading", { name: item.heading })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  }
});

test("plans navigation returns to home page sections", async ({ page }) => {
  await page.goto("/pricing");

  if ((page.viewportSize()?.width ?? 1024) < 768) {
    await page.getByRole("button", { name: "Open menu" }).click();
  }
  await page.getByRole("link", { name: "How it works" }).click();
  await expect(page).toHaveURL(/\/#how-it-works$/);
  await expect(page.getByRole("heading", { name: "Clear enough to use in the moment." })).toBeVisible();

  await page.goto("/pricing");
  if ((page.viewportSize()?.width ?? 1024) < 768) {
    await page.getByRole("button", { name: "Open menu" }).click();
  }
  await page.getByRole("link", { name: "Features" }).click();
  await expect(page).toHaveURL(/\/#features$/);
  await expect(page.getByRole("heading", { name: "Set up the board for the person using it." })).toBeVisible();
});

test("unknown routes show a recovery link", async ({ page }) => {
  await page.goto("/this-page-does-not-exist");
  await expect(page.getByText("Oops! Page not found")).toBeVisible();
  await expect(page.getByRole("link", { name: "Return to Home" })).toHaveAttribute("href", "/");
});
