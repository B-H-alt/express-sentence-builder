import { expect, test } from "@playwright/test";
import { seedLearner } from "./helpers";

test("quiet security checks still require a valid token and block expired verification", async ({ page }) => {
  await seedLearner(page);
  await page.route(/\/src\/lib\/captcha\.ts(?:\?.*)?$/, route => route.fulfill({
    contentType: "application/javascript",
    body: 'export const turnstileSiteKey = "synthetic-test-site-key"; export const isCaptchaConfigured = true;',
  }));
  // Simulate the documented widget callbacks. No real challenge is loaded or solved.
  await page.addInitScript(() => {
    Object.assign(window, {
      turnstile: {
        render: (container: HTMLElement, options: Record<string, unknown>) => {
          container.dataset.appearance = String(options.appearance);
          const verify = document.createElement("button");
          verify.type = "button";
          verify.textContent = "Verify synthetic widget";
          verify.onclick = () => (options.callback as (token: string) => void)("synthetic-verification-token");
          const expire = document.createElement("button");
          expire.type = "button";
          expire.textContent = "Expire synthetic widget";
          expire.onclick = () => (options["expired-callback"] as () => void)();
          const fail = document.createElement("button");
          fail.type = "button";
          fail.textContent = "Fail synthetic widget";
          fail.onclick = () => (options["error-callback"] as () => void)();
          container.append(verify, expire, fail);
          return "synthetic-widget";
        },
        remove: () => document.querySelector('[data-appearance="interaction-only"]')?.replaceChildren(),
      },
    });
  });
  let requestCount = 0;
  await page.route("**/auth/v1/token**", route => {
    requestCount++;
    expect(route.request().postDataJSON().gotrue_meta_security.captcha_token).toBe("synthetic-verification-token");
    return route.fulfill({ status: 400, json: { error_code: "invalid_credentials", msg: "Invalid login credentials" } });
  });
  await page.goto("/pecs-app?account=sign-in");
  await page.getByLabel("Email", { exact: true }).fill("test@example.com");
  await page.getByLabel("Password", { exact: true }).fill("not-a-real-password");
  const signIn = page.getByRole("button", { name: "Sign in", exact: true });
  await expect(signIn).toBeDisabled();
  await expect(page.locator('[data-appearance="interaction-only"]')).toBeVisible();
  await page.getByRole("button", { name: "Verify synthetic widget", exact: true }).click();
  await expect(signIn).toBeEnabled();
  await expect(page.getByText("Checking security…", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Expire synthetic widget", exact: true }).click();
  await expect(signIn).toBeDisabled();
  expect(requestCount).toBe(0);
  await page.getByRole("button", { name: "Fail synthetic widget", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("The security check could not load");
  await expect(signIn).toBeDisabled();
  await page.getByRole("button", { name: "Verify synthetic widget", exact: true }).click();
  await signIn.click();
  await expect(page.getByRole("status").filter({ hasText: "The email or password is incorrect." })).toBeVisible();
  expect(requestCount).toBe(1);
  await expect(signIn).toBeDisabled();
});
