import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets } from "./helpers";

test("landing sign-in opens the app and updates the account button", async ({ page }) => {
  await blockThirdPartyWidgets(page);
  await seedLearner(page);
  const user = {
    id: "11111111-1111-4111-8111-111111111111",
    aud: "authenticated", role: "authenticated", email: "test@example.com",
    email_confirmed_at: new Date().toISOString(),
    app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString(),
  };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 })}.test-signature`;
  await page.route("**/auth/v1/**", async (route) => {
    await route.fulfill({ json: route.request().url().includes("/token")
      ? { access_token: token, refresh_token: "test-refresh", token_type: "bearer", expires_in: 3600, user }
      : { user, ...user } });
  });
  await page.goto("/");
  const mobile = (page.viewportSize()?.width ?? 1280) < 768;
  if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await page.getByRole("button", { name: mobile ? "Sign in to your account" : "Sign in", exact: true }).click();
  await page.getByPlaceholder("parent@example.com").fill("test@example.com");
  await page.getByPlaceholder("Password", { exact: true }).fill("Test-password-123!");
  await page.getByRole("dialog").getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/pecs-app(?:\?|$)/);
  await expect(page.getByText("You're signed in", { exact: true })).toBeVisible();
  await page.goto("/");
  if (mobile) await page.getByRole("button", { name: "Open menu", exact: true }).click();
  await expect(page.getByRole("button", { name: "My account", exact: true })).toBeVisible();
});
