import { expect, test, type Page } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets, expectNoHorizontalOverflow } from "./helpers";

const openAccount = async (page: Page, suffix = "") => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.goto(`/pecs-app?account=sign-in${suffix}`);
  await expect(page.getByRole("heading", { name: "Sign in to Expressly", exact: true })).toBeVisible();
};

for (const provider of ["google", "apple"] as const) {
  const name = provider === "google" ? "Google" : "Apple";
  test(`${name} requires agreement and hands off without email or password`, async ({ page }) => {
    await page.route("**/auth/v1/settings", route => route.fulfill({ json: { external: { google: true, apple: true } } }));
    await page.route("**/auth/v1/authorize?**", async route => {
      const url = new URL(route.request().url());
      expect(url.searchParams.get("provider")).toBe(provider);
      expect(url.searchParams.get("redirect_to")).toBe("http://127.0.0.1:8090/pecs-app?account=sign-in");
      expect(url.searchParams.has("email")).toBe(false);
      await route.fulfill({ contentType: "text/html", body: `<h1>${name} test handoff</h1>` });
    });
    await openAccount(page);
    await page.getByRole("button", { name: "Other ways to continue", exact: true }).click();
    const button = page.getByRole("button", { name: `Continue with ${name}`, exact: true });
    await expect(button).toBeDisabled();
    await page.locator("#account-agreement").check();
    await expect(button).toBeEnabled();
    await button.click();
    await expect(page.getByRole("heading", { name: `${name} test handoff` })).toBeVisible();
  });

  test(`${name} disabled provider stays in Expressly and allows retry`, async ({ page }) => {
    await page.route("**/auth/v1/settings", route => route.fulfill({ json: { external: { google: false, apple: false } } }));
    await openAccount(page);
    await page.getByRole("button", { name: "Other ways to continue", exact: true }).click();
    await page.locator("#account-agreement").check();
    await page.getByRole("button", { name: `Continue with ${name}`, exact: true }).click();
    await expect(page.getByRole("status")).toHaveText(`${name} sign-in is not available yet. Please try another sign-in method.`);
    await expect(page).toHaveURL(/\/pecs-app\?account=sign-in$/);
    await expect(page.getByRole("button", { name: `Continue with ${name}`, exact: true })).toBeEnabled();
  });
}

test("provider connection failure restores both buttons", async ({ page }) => {
  await page.route("**/auth/v1/settings", route => route.fulfill({ status: 503, json: {} }));
  await openAccount(page);
    await page.getByRole("button", { name: "Other ways to continue", exact: true }).click();
  await page.locator("#account-agreement").check();
  await page.getByRole("button", { name: "Continue with Google", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("We could not start Google sign-in. Check your connection and try again.");
  await expect(page.getByRole("button", { name: "Continue with Google", exact: true })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Continue with Apple", exact: true })).toBeEnabled();
});

test("cancelled provider callback gives safe recovery and removes error details", async ({ page }) => {
  await openAccount(page, "#error=access_denied&error_code=provider_error&error_description=untrusted-provider-text");
  await expect(page.getByRole("status")).toContainText("Sign-in was not completed");
  await expect(page).toHaveURL("http://127.0.0.1:8090/pecs-app?account=sign-in");
  await expect(page.getByText("untrusted-provider-text")).toHaveCount(0);
});

test("successful social callback saves agreement and opens the signed-in app", async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  const acceptedAt = "2026-10-20T15:00:00.000Z";
  await page.addInitScript(value => {
    if (new URLSearchParams(window.location.search).get("account") === "sign-in") {
      window.sessionStorage.setItem("expressly-social-agreement-v1", value);
    }
  }, acceptedAt);
  const user = {
    id: "11111111-1111-4111-8111-111111111111", aud: "authenticated", role: "authenticated",
    email: "test@example.com", app_metadata: { provider: "google" },
    user_metadata: {}, created_at: new Date().toISOString(),
  };
  const encode = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, exp: Math.floor(Date.now() / 1000) + 3600 })}.test-signature`;
  let savedAgreement = false;
  await page.route("**/auth/v1/**", async route => {
    if (route.request().method() === "PUT") {
      expect(route.request().postDataJSON().data).toMatchObject({
        account_agreement_version: "2026-10-11",
        account_agreement_accepted_at: acceptedAt,
      });
      savedAgreement = true;
    }
    await route.fulfill({ json: user });
  });
  await page.goto(`/pecs-app?account=sign-in#access_token=${token}&refresh_token=test-refresh&expires_in=3600&token_type=bearer`);
  await expect(page.getByText("You're signed in", { exact: true })).toBeVisible();
  expect(savedAgreement).toBe(true);
  expect(await page.evaluate(() => window.sessionStorage.getItem("expressly-social-agreement-v1"))).toBeNull();
  expect(await page.evaluate(() => window.localStorage.getItem("expressly-active-account-scope-v1"))).toBe(`user:${user.id}`);
});

test("email sign-in stays simple and other methods remain reachable", async ({ page }, testInfo) => {
  await openAccount(page);
  await expect(page.getByRole("heading", { name: "Sign in to Expressly", exact: true })).toBeFocused();
  await expectNoHorizontalOverflow(page);
  await expect(page.getByRole("tab", { name: "Create account", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue with Google", exact: true })).toHaveCount(0);
  await expect(page.locator("#account-agreement")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Email me a sign-in link", exact: true })).toHaveCount(0);
  await page.screenshot({ path: `artifacts/account-simplification/sign-in-${testInfo.project.name}.png` });
  await page.getByRole("tab", { name: "Create account", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Create your account", exact: true })).toBeVisible();
  await expect(page.locator("#account-agreement")).not.toBeChecked();
  await page.screenshot({ path: `artifacts/account-simplification/create-account-${testInfo.project.name}.png` });
  await page.getByRole("button", { name: "Other ways to continue", exact: true }).click();
  await expect(page.getByRole("button", { name: "Continue with Google", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Continue with Apple", exact: true })).toBeDisabled();
  await expect(page.getByPlaceholder("parent@example.com")).toHaveCount(0);
  await expectNoHorizontalOverflow(page);
  await page.screenshot({ path: `artifacts/account-simplification/other-methods-${testInfo.project.name}.png` });
  await page.getByRole("button", { name: "Back to email and password", exact: true }).click();
  await expect(page.getByRole("tab", { name: "Create account", exact: true })).toHaveAttribute("aria-selected", "true");
  await page.evaluate(() => window.localStorage.setItem("expressly-theme", "dark"));
  await page.reload();
  await expect(page.getByRole("heading", { name: "Sign in to Expressly", exact: true })).toBeVisible();
  await expect(page.locator("html")).toHaveClass(/dark/);
  await page.screenshot({ path: `artifacts/account-simplification/sign-in-dark-${testInfo.project.name}.png` });
});
