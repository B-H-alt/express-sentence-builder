import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets } from "./helpers";

test("sentence labels and remove controls have separate space", async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.addInitScript(() => {
    const stored = JSON.parse(localStorage.getItem("pecs-storage")!);
    stored.state.sentence = ["Mom", "All done", "Peanut butter sandwich"].map((text, index) => ({ id: `layout-${index}`, text, category: "objects", usage: 0 }));
    localStorage.setItem("pecs-storage", JSON.stringify(stored));
  });
  await page.goto("/pecs-app");
  for (const label of ["Mom", "All done", "Peanut butter sandwich"]) {
    const remove = page.getByRole("button", { name: `Remove ${label} from sentence`, exact: true });
    await expect(remove).toBeVisible();
    const layout = await remove.evaluate((button) => {
      const footer = button.parentElement!;
      const card = footer.parentElement!.parentElement!;
      const word = footer.querySelector("span")!.getBoundingClientRect();
      const control = button.getBoundingClientRect();
      const bounds = card.getBoundingClientRect();
      return { separated: word.right <= control.left, contained: word.bottom <= bounds.bottom && control.bottom <= bounds.bottom, width: bounds.width, height: bounds.height };
    });
    expect(layout.separated).toBe(true);
    expect(layout.contained).toBe(true);
    expect(layout.width).toBe(100);
    expect(layout.height).toBe(100);
  }
  await page.getByRole("button", { name: "Remove Mom from sentence", exact: true }).click();
  await expect(page.getByRole("button", { name: "Remove Mom from sentence", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Remove All done from sentence", exact: true })).toBeVisible();
});
