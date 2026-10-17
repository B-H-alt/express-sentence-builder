import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets, expectNoHorizontalOverflow, openSettings, returnToBoard } from "./helpers";

test("accessibility is optional, persists, and resets without changing learner settings", async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.goto("/pecs-app");
  await openSettings(page);
  await page.getByRole("tab", { name: "Accessibility", exact: true }).click();
  for (const name of ["Reduce motion", "Plain backgrounds", "Softer colors", "Stronger contrast"]) {
    const control = page.getByRole("switch", { name, exact: true });
    await expect(control).toHaveAttribute("aria-checked", "false");
    await control.click();
    await expect(control).toHaveAttribute("aria-checked", "true");
  }
  await expectNoHorizontalOverflow(page);
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("pecs-storage")!).state);
  expect(Object.values(stored.accessibility)).toEqual([true, true, true, true]);
  const fresh = await page.context().newPage();
  await fresh.goto("/pecs-app");
  await expect(fresh.locator("html")).toHaveClass(/accessibility-reduceMotion/);
  await expect(fresh.locator("html")).toHaveClass(/accessibility-softerColors/);
  await fresh.close();
  await page.getByRole("button", { name: "Reset accessibility settings", exact: true }).click();
  const reset = await page.evaluate(() => JSON.parse(localStorage.getItem("pecs-storage")!).state);
  expect(Object.values(reset.accessibility)).toEqual([false, false, false, false]);
  for (const key of ["userName", "currentLevel", "lowStimulationMode", "cardsPerPage", "favorites", "customCards", "savedPhrases"]) expect(reset[key]).toEqual(stored[key]);
  await expect(page.getByRole("button", { name: "Reset accessibility settings", exact: true })).toBeDisabled();
});

test("all themes and combinations keep symbols unchanged and remove visual effects", async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.goto("/pecs-app");
  await page.getByRole("button", { name: "People", exact: true }).click();
  await page.getByRole("button", { name: "Add Mom to sentence", exact: true }).waitFor();
  const results = await page.evaluate(async () => {
    const { useCardStore } = await import("/src/store/cardStore.ts");
    const keys = ["reduceMotion", "plainBackgrounds", "softerColors", "strongerContrast"] as const;
    const wait = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    const image = document.querySelector('img[alt="Mom"]') as HTMLImageElement;
    const original = image.src;
    const issues: string[] = [];
    const luminance = (color: string) => {
      const values = color.match(/[\d.]+/g)!.slice(0, 3).map(Number).map((value) => {
        const channel = value / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
      });
      return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
    };
    for (const theme of ["light", "dark", "warm", "warm-dark", "sage", "sage-dark", "lavender", "lavender-dark", "rose", "rose-dark"]) {
      document.documentElement.classList.remove("light", "dark", "warm", "warm-dark", "sage", "sage-dark", "lavender", "lavender-dark", "rose", "rose-dark");
      document.documentElement.classList.add(theme);
      for (let mask = 0; mask < 16; mask++) {
        for (let i = 0; i < keys.length; i++) useCardStore.getState().setAccessibility(keys[i], Boolean(mask & (1 << i)));
        await wait();
        if (image.src !== original || getComputedStyle(image).filter !== "none") issues.push(`${theme}/${mask}: altered artwork`);
        const shell = document.querySelector(".app-shell")!;
        if ((mask & 2) && getComputedStyle(shell).backgroundImage !== "none") issues.push(`${theme}/${mask}: background not plain`);
        if ((mask & 1) && parseFloat(getComputedStyle(image.closest('[role="button"]')!).transitionDuration) > 0.001) issues.push(`${theme}/${mask}: transition still active`);
        if (mask & 8) {
          const selected = document.querySelector('button.bg-gradient-accent')!;
          // Finish color transitions before evaluating their final contrast.
          void getComputedStyle(selected).color;
          selected.getAnimations().forEach((animation) => animation.finish());
          const style = getComputedStyle(selected);
          const text = luminance(style.color), background = luminance(style.backgroundColor);
          const ratio = (Math.max(text, background) + 0.05) / (Math.min(text, background) + 0.05);
          if (ratio < 4.5) issues.push(`${theme}/${mask}: selected text contrast ${ratio}`);
        }
      }
    }
    return issues;
  });
  expect(results).toEqual([]);
  // App-scoped effects must not leak into public pages.
  await page.getByRole("button", { name: "Add Mom to sentence", exact: true }).click();
  await expect(page.getByRole("button", { name: "Remove Mom from sentence", exact: true })).toBeVisible();
  await page.getByRole("link", { name: "Return to Expressly website", exact: true }).click();
  await expect(page.locator("html")).not.toHaveClass(/accessibility-/);
});

test("device reduced motion still applies and malformed stored preferences are safe", async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.addInitScript(() => {
    const data = JSON.parse(localStorage.getItem("pecs-storage")!);
    data.state.accessibility = { reduceMotion: "false", plainBackgrounds: null, softerColors: true };
    localStorage.setItem("pecs-storage", JSON.stringify(data));
  });
  await page.goto("/pecs-app");
  await page.getByRole("button", { name: "People", exact: true }).click();
  const card = page.getByRole("button", { name: "Add Mom to sentence", exact: true });
  await card.waitFor();
  expect(await card.evaluate((element) => parseFloat(getComputedStyle(element).transitionDuration))).toBeLessThan(0.001);
  await expect(page.locator("html")).not.toHaveClass(/accessibility-reduceMotion/);
  await expect(page.locator("html")).toHaveClass(/accessibility-softerColors/);
});
