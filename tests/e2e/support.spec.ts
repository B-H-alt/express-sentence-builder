import { expect, test } from "@playwright/test";
import { expectNoHorizontalOverflow, blockThirdPartyWidgets } from "./helpers";

test("support is public, has keyboard-accessible answers, and explains contact", async ({ page }) => {
  await blockThirdPartyWidgets(page);
  await page.goto("/support");
  await expect(page.getByRole("heading", { name: "Help & Support", exact: true })).toBeVisible();
  const audioQuestion = page.locator("summary").filter({ hasText: "I can't hear anything" });
  await audioQuestion.focus();
  await audioQuestion.press("Enter");
  await expect(page.getByText(/Check your device volume and sound output first/)).toBeVisible();
  await expect(page.getByRole("link", { name: "expressly54@gmail.com", exact: true })).toHaveAttribute("href", /^mailto:expressly54@gmail\.com\?/);
  await expect(page.getByText(/Nothing is sent until you send the email/)).toBeVisible();
  await expectNoHorizontalOverflow(page);
  await page.getByRole("link", { name: "Open Expressly", exact: true }).click();
  await expect(page).toHaveURL(/\/pecs-app$/);
});

test("website footer links to support", async ({ page }) => {
  await blockThirdPartyWidgets(page);
  await page.goto("/");
  await page.getByRole("link", { name: "Help & Support", exact: true }).click();
  await expect(page).toHaveURL(/\/support$/);
});
