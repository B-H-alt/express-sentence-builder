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

const publicPages = [
  { path: "/support", heading: "Help & Support" },
  { path: "/about", heading: "Communication should not fail when it matters most." },
  { path: "/privacy", heading: "Privacy Policy" },
  { path: "/terms", heading: "Terms of Use" },
];

for (const item of publicPages) {
  test(`${item.path} loads and remains usable`, async ({ page }) => {
    await page.goto(item.path);
    await expect(page.getByRole("heading", { name: item.heading })).toBeVisible();
    await expectNoHorizontalOverflow(page);
  });
}

test("unknown routes show a recovery link", async ({ page }) => {
  await page.goto("/this-page-does-not-exist");
  await expect(page.getByText("Oops! Page not found")).toBeVisible();
  await expect(page.getByRole("link", { name: "Return to Home" })).toHaveAttribute("href", "/");
});
