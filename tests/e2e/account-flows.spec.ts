import { expect, test, type Page } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets } from "./helpers";

const openAccount = async (page: Page) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.goto("/pecs-app?account=sign-in");
  await expect(page.getByRole("heading", { name: "Sign in to Expressly", exact: true })).toBeVisible();
};

test("sign-up requires agreement and sends the confirmation redirect", async ({ page }) => {
  let payload: Record<string, unknown> = {};
  let requestUrl = "";
  await page.route("**/auth/v1/signup**", async (route) => {
    payload = route.request().postDataJSON();
    requestUrl = route.request().url();
    await route.fulfill({ json: { user: { id: "signup-test", email: "test@example.com" }, session: null } });
  });
  await openAccount(page);
  await page.getByRole("tab", { name: "Create account", exact: true }).click();
  await page.getByPlaceholder("parent@example.com").fill("test@example.com");
  await page.getByPlaceholder("At least 12 characters", { exact: true }).fill("Test-password-123!");
  await page.getByPlaceholder("Enter it again").fill("Test-password-123!");
  const submit = page.getByRole("button", { name: "Create parent account", exact: true });
  await expect(submit).toBeDisabled();
  await page.locator("#account-agreement").check();
  await submit.click();
  await expect(page.getByRole("heading", { name: "Account created", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("Check your email to confirm your account");
  await expect(page.getByRole("dialog")).toContainText("test@example.com");
  await expect(page.getByPlaceholder("Enter it again")).toHaveCount(0);
  await expect(page.getByRole("dialog").locator("form")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Continue with Google", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Resend email in/ })).toBeDisabled();
  await expect(page.getByRole("heading", { name: "Account created", exact: true })).toBeFocused();
  await page.screenshot({ path: `artifacts/signup-confirmation-${test.info().project.name}.png` });
  expect(payload.email).toBe("test@example.com");
  expect(payload.data).toMatchObject({ account_agreement_version: "2026-10-11" });
  expect(new URL(requestUrl).searchParams.get("redirect_to")).toMatch(/\/pecs-app\?account=sign-in$/);
});

test("confirmation resend handles delivery errors and allows a retry", async ({ page }) => {
  await page.route("**/auth/v1/signup**", route => route.fulfill({ json: { user: { id: "signup-test", email: "test@example.com" }, session: null } }));
  let resendCount = 0;
  await page.route("**/auth/v1/resend**", route => {
    resendCount++;
    const payload = route.request().postDataJSON();
    expect(payload.email).toBe("test@example.com");
    expect(payload.type).toBe("signup");
    expect(new URL(route.request().url()).searchParams.get("redirect_to")).toMatch(/\/pecs-app\?account=sign-in$/);
    return resendCount === 1
      ? route.fulfill({ status: 500, json: { msg: "Error sending confirmation email" } })
      : route.fulfill({ json: {} });
  });
  await openAccount(page);
  await page.clock.install();
  await page.getByRole("tab", { name: "Create account", exact: true }).click();
  await page.getByPlaceholder("parent@example.com").fill("test@example.com");
  await page.getByPlaceholder("At least 12 characters", { exact: true }).fill("Test-password-123!");
  await page.getByPlaceholder("Enter it again").fill("Test-password-123!");
  await page.locator("#account-agreement").check();
  await page.getByRole("button", { name: "Create parent account", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Account created", exact: true })).toBeVisible();
  await page.clock.runFor(61_000);
  await page.getByRole("button", { name: "Resend confirmation email", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("We could not resend the email");
  await page.getByRole("button", { name: "Resend confirmation email", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Confirmation email requested");
  expect(resendCount).toBe(2);
  await page.getByRole("button", { name: "Back to sign in", exact: true }).click();
  await expect(page.getByPlaceholder("parent@example.com")).toHaveValue("test@example.com");
  await expect(page.getByPlaceholder("Password", { exact: true })).toHaveValue("");
});

test("failed signup does not show a successful confirmation screen", async ({ page }) => {
  await page.route("**/auth/v1/signup**", route => route.fulfill({ status: 500, json: { msg: "Error sending confirmation email" } }));
  await openAccount(page);
  await page.getByRole("tab", { name: "Create account", exact: true }).click();
  await page.getByPlaceholder("parent@example.com").fill("test@example.com");
  await page.getByPlaceholder("At least 12 characters", { exact: true }).fill("Test-password-123!");
  await page.getByPlaceholder("Enter it again").fill("Test-password-123!");
  await page.locator("#account-agreement").check();
  await page.getByRole("button", { name: "Create parent account", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("We could not create your account or send the confirmation email");
  await expect(page.getByRole("heading", { name: "Account created", exact: true })).toHaveCount(0);
});

test("an obscured repeat signup offers sign-in without claiming a new account", async ({ page }) => {
  await page.route("**/auth/v1/signup**", route => route.fulfill({ json: { user: { id: "obscured", email: "test@example.com", identities: [] }, session: null } }));
  await openAccount(page);
  await page.getByRole("tab", { name: "Create account", exact: true }).click();
  await page.getByPlaceholder("parent@example.com").fill("test@example.com");
  await page.getByPlaceholder("At least 12 characters", { exact: true }).fill("Test-password-123!");
  await page.getByPlaceholder("Enter it again").fill("Test-password-123!");
  await page.locator("#account-agreement").check();
  await page.getByRole("button", { name: "Create parent account", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Check your email or sign in", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).not.toContainText("Check your email to confirm your account");
  await page.getByRole("button", { name: "Back to sign in", exact: true }).click();
  await page.getByRole("button", { name: "Forgot password?", exact: true }).click();
  await expect(page.getByPlaceholder("parent@example.com")).toHaveValue("test@example.com");
});

test("incorrect password leaves a clear message and permits retry", async ({ page }) => {
  await page.route("**/auth/v1/token**", route => route.fulfill({ status: 400, json: { error_code: "invalid_credentials", msg: "Invalid login credentials" } }));
  await openAccount(page);
  await page.getByPlaceholder("parent@example.com").fill("test@example.com");
  await page.getByPlaceholder("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("dialog").getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("status")).toHaveText("The email or password is incorrect.");
  await expect(page.getByRole("dialog").getByRole("button", { name: "Sign in", exact: true })).toBeEnabled();
  await expect(page.getByPlaceholder("Password", { exact: true })).toHaveValue("");
});

test("password-free sign-in explains the email link before sending it", async ({ page }) => {
  let sent = false;
  await page.route("**/auth/v1/otp**", route => {
    const payload = route.request().postDataJSON();
    expect(payload.email).toBe("test@example.com");
    expect(payload.create_user).toBe(false);
    sent = true;
    return route.fulfill({ json: {} });
  });
  await openAccount(page);
  await page.getByRole("button", { name: "Other ways to continue", exact: true }).click();
  await page.getByRole("button", { name: "Sign in without a password", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Sign in with an email link", exact: true })).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("We’ll email you a link that signs you in");
  await expect(page.getByPlaceholder("Password", { exact: true })).toHaveCount(0);
  await page.getByRole("button", { name: "Send sign-in link", exact: true }).click();
  expect(sent).toBe(false);
  await page.getByLabel("Email", { exact: true }).fill("test@example.com");
  await page.getByRole("button", { name: "Send sign-in link", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("If an account exists");
  expect(sent).toBe(true);
});

test("account tabs work with the keyboard and keep signup separate from sign-in", async ({ page }) => {
  await openAccount(page);
  await page.getByLabel("Email", { exact: true }).fill("test@example.com");
  await page.getByLabel("Password", { exact: true }).fill("not-a-real-password");
  await page.getByRole("tab", { name: "Sign in", exact: true }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Create account", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.getByLabel("Email", { exact: true })).toHaveValue("test@example.com");
  await expect(page.getByLabel("Password", { exact: true })).toHaveValue("");
  await expect(page.locator("#account-agreement")).not.toBeChecked();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("tab", { name: "Sign in", exact: true })).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#account-agreement")).toHaveCount(0);
});

test("reset email uses account redirect and prevents immediate resend", async ({ page }) => {
  let count = 0;
  await page.route("**/auth/v1/recover**", async route => {
    count++;
    expect(new URL(route.request().url()).searchParams.get("redirect_to")).toMatch(/\/pecs-app\?account=sign-in$/);
    await route.fulfill({ json: {} });
  });
  await openAccount(page);
  await page.getByRole("button", { name: "Forgot password?", exact: true }).click();
  await page.getByPlaceholder("parent@example.com").fill("test@example.com");
  await page.getByRole("button", { name: "Send password reset link", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("If an account exists");
  await expect(page.getByRole("button", { name: /Try again in/ })).toBeDisabled();
  expect(count).toBe(1);
});

test("recovery link opens password editor rather than redirecting away", async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  const user = { id: "11111111-1111-4111-8111-111111111111", aud: "authenticated", role: "authenticated", email: "test@example.com", app_metadata: {}, user_metadata: {}, created_at: new Date().toISOString() };
  const encode = (v: unknown) => Buffer.from(JSON.stringify(v)).toString("base64url");
  const token = `${encode({ alg: "HS256", typ: "JWT" })}.${encode({ sub: user.id, exp: Math.floor(Date.now()/1000)+3600 })}.test-signature`;
  let updated = false;
  await page.route("**/auth/v1/**", route => {
    if (route.request().method() === "PUT") {
      expect(route.request().postDataJSON().password).toBe("New-password-123!");
      updated = true;
    }
    return route.fulfill({ json: user });
  });
  await page.goto(`/pecs-app?account=sign-in#access_token=${token}&refresh_token=test-refresh&expires_in=3600&token_type=bearer&type=recovery`);
  await expect(page.getByRole("heading", { name: "Choose a new password", exact: true })).toBeVisible();
  // Allow initial auth checks to finish, so a late redirect cannot hide a failure.
  await page.waitForTimeout(1000);
  await page.getByPlaceholder("At least 12 characters", { exact: true }).fill("New-password-123!");
  await page.getByPlaceholder("Enter it again").fill("New-password-123!");
  await page.getByRole("button", { name: "Save new password", exact: true }).click();
  await expect(page.getByRole("status")).toContainText("Password updated");
  expect(updated).toBe(true);
});
