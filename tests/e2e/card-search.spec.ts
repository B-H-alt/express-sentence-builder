import { expect, test } from "@playwright/test";
import { searchCardLabels } from "../../src/utils/card-search";
import { seedLearner, blockThirdPartyWidgets } from "./helpers";

test("label search tolerates one typo without matching synonyms or unrelated short words", () => {
  const cards = ["Apple", "Happy", "Dad", "Eat", "I need help", "Papá"];
  const search = (query: string) => searchCardLabels(cards, query, (card) => [card]);
  for (const query of ["aple", "appel", "applle", "applr"]) {
    expect(search(query)).toEqual({ cards: ["Apple"], similarSpelling: true });
  }
  expect(search(" apple ")).toEqual({ cards: ["Apple"], similarSpelling: false });
  expect(search("app")).toEqual({ cards: ["Apple", "Happy"], similarSpelling: false });
  expect(search("Papa").cards).not.toContain("Dad");
  expect(search("Daddy").cards).toEqual([]);
  expect(search("at").similarSpelling).toBe(false);
  expect(search("hele").cards).toEqual(["I need help"]);
  expect(search("x".repeat(100))).toEqual({ cards: [], similarSpelling: false });
});

test("a typo finds the real card, while an unknown word explains the next step", async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.goto("/pecs-app");
  const search = page.getByRole("searchbox", { name: "Find a card" });
  await search.fill("hapyp");
  await expect(page.getByRole("button", { name: "Add Happy to sentence", exact: true })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("Cards with similar spelling.");
  await page.getByRole("button", { name: "Add Happy to sentence", exact: true }).click();
  await expect(page.getByRole("button", { name: "Remove Happy from sentence", exact: true })).toBeVisible();
  await search.fill("Papa");
  await expect(page.getByRole("button", { name: "Add Dad to sentence", exact: true })).toHaveCount(0);
  await search.fill("zzzzzz");
  await expect(page.getByText("No matching cards", { exact: true })).toBeVisible();
  await expect(page.getByText(/Try a shorter word, or clear the search/)).toBeVisible();
  await page.getByRole("button", { name: "Clear card search", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Your quick cards", exact: true })).toBeVisible();
});
