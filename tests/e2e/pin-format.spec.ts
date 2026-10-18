import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets } from "./helpers";

test("new PINs clearly require exactly four numeric digits", async ({ page }) => {
  await seedLearner(page); await blockThirdPartyWidgets(page);
  await page.goto("/caregiver");
  const pin = page.getByLabel("Create PIN", { exact: true });
  const confirm = page.getByLabel("Confirm PIN", { exact: true });
  await expect(pin).toHaveAttribute("maxlength", "4");
  await expect(pin).toHaveAttribute("pattern", "[0-9]{4}");
  await expect(pin).not.toHaveAttribute("placeholder");
  await expect(pin).toHaveAccessibleDescription("4 digits · Numbers only");
  await pin.fill("123456"); await expect(pin).toHaveValue("1234");
  await pin.fill("12ab"); await expect(pin).toHaveValue("12");
  await confirm.fill("1234");
  await page.getByRole("button", { name: "Save PIN and continue", exact: true }).click();
  await expect(page.getByRole("button", { name: "Settings", exact: true })).toHaveCount(0);
  await pin.fill("1234");
  await page.getByRole("button", { name: "Save PIN and continue", exact: true }).click();
  await expect(page.getByRole("button", { name: "Settings", exact: true })).toBeVisible();
});

test("an existing six-digit PIN still unlocks safely", async ({ page }) => {
  await seedLearner(page); await blockThirdPartyWidgets(page);
  await page.goto("/caregiver");
  await page.evaluate(async () => {
    const { hashPin } = await import("/src/lib/caregiverPin.ts");
    const salt = btoa("format-test-salt");
    localStorage.setItem("expressly-parent-pin-v1", JSON.stringify({ salt, hash: await hashPin("123456", salt, 2), version: 2 }));
    window.dispatchEvent(new Event("expressly-pin-changed"));
  });
  const pin = page.getByLabel("Parent PIN", { exact: true });
  await expect(pin).toHaveAttribute("maxlength", "6");
  await pin.fill("123456");
  await page.getByRole("button", { name: "Unlock caregiver area", exact: true }).click();
  await expect(page.getByRole("button", { name: "Settings", exact: true })).toBeVisible();
});
