import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets } from "./helpers";

test.beforeEach(async ({ page }) => {
  await seedLearner(page); await blockThirdPartyWidgets(page); await page.goto("/pecs-app");
  await page.getByRole("searchbox", { name: "Find a card" }).waitFor();
});

test("backup round trip keeps pictures, preferences, phrases, activity and usage after reopening", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { useCardStore } = await import("/src/store/cardStore.ts");
    const { createExpresslyData } = await import("/src/lib/accountDataExport.ts");
    const { parseBoardBackup, restoreBoardBackup } = await import("/src/lib/boardBackup.ts");
    const canvas = document.createElement("canvas"); canvas.width = 2; canvas.height = 2;
    const photo = canvas.toDataURL("image/png");
    const mom = useCardStore.getState().cards.find(card => card.text === "Mom")!;
    localStorage.setItem("expressly-theme", "sage-dark");
    localStorage.setItem("expressly-parent-pin-v1", "unchanged-test-pin");
    useCardStore.setState({
      userName: "Backup Learner", userImage: photo, characterGender: "boy", language: "es", currentLevel: 5,
      cardsPerPage: 8, textSize: "large", speechRate: .9, speechVolume: .6, lowStimulationMode: true,
      accessibility: { reduceMotion: true, plainBackgrounds: true, softerColors: false, strongerContrast: true },
      customCards: [{ id: "custom-backup", text: "My house", category: "places", imageUrl: photo, usage: 4, level: 3 }],
      favorites: [mom.id, "custom-backup"], recentCardIds: [mom.id], hiddenCategories: ["sports"],
      savedPhrases: [{ id: "phrase-backup", text: "I need a break", language: "en" }], sentence: [{ ...mom, text: "Mama" }],
      progressEntries: [{ id: "progress-backup", completedAt: new Date().toISOString(), cardLabels: ["Mom"], sentenceText: "Mom", wordCount: 1 }],
      cards: useCardStore.getState().cards.map(card => card.id === mom.id ? { ...card, usage: 7 } : card),
    });
    const backup = createExpresslyData();
    useCardStore.setState({ userName: "Different", customCards: [], savedPhrases: [], favorites: [], progressEntries: [] });
    restoreBoardBackup(parseBoardBackup(JSON.stringify(backup)));
    const restored = createExpresslyData();
    return { backup, restored, pin: localStorage.getItem("expressly-parent-pin-v1") };
  });
  expect(result.restored).toEqual({ ...result.backup, exportedAt: result.restored.exportedAt });
  expect(result.pin).toBe("unchanged-test-pin");
  // A fresh tab avoids the seed helper overwriting restored local storage.
  const fresh = await page.context().newPage(); await fresh.goto("/pecs-app");
  await fresh.getByRole("searchbox").waitFor();
  const reopened = await fresh.evaluate(async () => (await import("/src/lib/accountDataExport.ts")).createExpresslyData());
  expect(reopened).toEqual({ ...result.backup, exportedAt: reopened.exportedAt });
  await fresh.close();
});

test("invalid, executable-image and over-quota restores leave the original board intact", async ({ page }) => {
  const errors = await page.evaluate(async () => {
    const { useCardStore } = await import("/src/store/cardStore.ts");
    const { createExpresslyData } = await import("/src/lib/accountDataExport.ts");
    const { parseBoardBackup, restoreBoardBackup } = await import("/src/lib/boardBackup.ts");
    const backup = createExpresslyData(); const before = localStorage.getItem("pecs-storage");
    const bad = ["{}", "not json", JSON.stringify({ ...backup, exportVersion: 99 }), JSON.stringify({ ...backup, learnerProfile: { ...backup.learnerProfile, profileImage: "javascript:alert(1)" } }), JSON.stringify({ ...backup, customCards: [{ id: backup.currentSentence[0]?.id ?? useCardStore.getState().cards[0].id, text: "collision", category: "people", usage: 0 }] })];
    let rejected = 0;
    for (const input of bad) { try { parseBoardBackup(input); } catch { rejected++; } }
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) { if (key === "pecs-storage") throw new DOMException("Full", "QuotaExceededError"); return original.call(this, key, value); };
    let quota = false;
    try { restoreBoardBackup(backup); } catch { quota = true; } finally { Storage.prototype.setItem = original; }
    return { rejected, quota, unchanged: before === localStorage.getItem("pecs-storage"), name: useCardStore.getState().userName };
  });
  expect(errors).toEqual({ rejected: 5, quota: true, unchanged: true, name: "Test Learner" });
});

test("file selection previews without replacing and requires a safety download", async ({ page }) => {
  const backup = await page.evaluate(async () => (await import("/src/lib/accountDataExport.ts")).createExpresslyData());
  backup.learnerProfile.name = "Imported Learner";
  await page.getByRole("button", { name: "Open Test Learner's learner profile", exact: true }).click();
  await page.getByRole("menuitem", { name: "Profile & settings", exact: true }).click();
  await page.getByText("Backup", { exact: true }).click();
  const file = { name: "backup.json", mimeType: "application/json", buffer: Buffer.from(JSON.stringify(backup)) };
  await page.getByLabel("Choose Expressly backup").setInputFiles(file);
  await expect(page.getByRole("heading", { name: "Restore this backup?" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Replace with backup" })).toBeDisabled();
  await page.getByRole("button", { name: "Cancel", exact: true }).click();
  await expect(page.locator("#learner-profile-name")).toHaveValue("Test Learner");
  await page.getByLabel("Choose Expressly backup").setInputFiles(file);
  const download = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download current backup", exact: true }).click();
  expect((await download).suggestedFilename()).toMatch(/^expressly-data-/);
  await page.getByRole("button", { name: "Replace with backup", exact: true }).click();
  await expect(page.getByRole("button", { name: "Open Imported Learner's learner profile", exact: true })).toBeVisible();
});

test("older version-one exports without new preferences remain restorable", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { createExpresslyData } = await import("/src/lib/accountDataExport.ts");
    const { parseBoardBackup, restoreBoardBackup } = await import("/src/lib/boardBackup.ts");
    const { useCardStore } = await import("/src/store/cardStore.ts");
    const legacy = createExpresslyData();
    delete legacy.preferences.theme; delete legacy.preferences.accessibility; delete legacy.cardUsage;
    localStorage.setItem("expressly-theme", "warm");
    restoreBoardBackup(parseBoardBackup(JSON.stringify(legacy)));
    return { name: useCardStore.getState().userName, theme: localStorage.getItem("expressly-theme"), accessibility: useCardStore.getState().accessibility };
  });
  expect(result).toEqual({ name: "Test Learner", theme: "warm", accessibility: { reduceMotion: false, plainBackgrounds: false, softerColors: false, strongerContrast: false } });
});
