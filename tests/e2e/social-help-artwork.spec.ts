import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets } from "./helpers";

for (const gender of ["boy", "girl"] as const) {
  test(`${gender} Please, Thank you and Help load their character artwork without changing card identities`, async ({ page }) => {
    await seedLearner(page);
    await blockThirdPartyWidgets(page);
    await page.goto("/pecs-app");
    await page.getByRole("searchbox", { name: "Find a card" }).waitFor();
    await page.evaluate(async (character) => {
      const { useCardStore } = await import("/src/store/cardStore.ts");
      useCardStore.getState().setCharacterGender(character);
    }, gender);
    for (const [label, id] of [["Please", "l1-44"], ["Thank you", "l1-45"], ["Help", "l1-13"]]) {
      await page.getByRole("searchbox", { name: "Find a card" }).fill(label);
      const card = page.getByRole("button", { name: `Add ${label} to sentence`, exact: true });
      const image = card.getByRole("img", { name: label, exact: true });
      await expect(image).toHaveAttribute("src", new RegExp(`/${gender}/${id}\\.jpg`));
      await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.naturalWidth)).toBeGreaterThan(0);
      await card.click();
      await expect(page.getByRole("button", { name: `Remove ${label} from sentence`, exact: true })).toBeVisible();
    }
    expect(await page.evaluate(async () => {
      const { useCardStore } = await import("/src/store/cardStore.ts");
      return useCardStore.getState().sentence.map(card => card.id);
    })).toEqual(["l1-44", "l1-45", "l1-13"]);
  });
}
