import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets } from "./helpers";

test("legacy active, archived and journal wording is removed before hydration", async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.addInitScript(() => {
    const active = JSON.parse(localStorage.getItem("pecs-storage")!);
    active.state.sentence = [{ id: "private", text: "PRIVATE_SENTENCE" }];
    active.state.recentCardIds = ["private"];
    active.state.progressEntries = [{ id: "old", completedAt: "2026-10-21T12:00:00Z", wordCount: 7, cardLabels: ["PRIVATE_HISTORY"], sentenceText: "PRIVATE_HISTORY" }];
    active.state.savedPhrases = [{ id: "saved", text: "Deliberately saved", language: "en" }];
    active.state.cardUsage = { mom: 3 };
    for (const key of ["pecs-storage", "expressly-account-data-v1:user:other"]) localStorage.setItem(key, JSON.stringify(active));
    localStorage.setItem("pecs-interactions-v1", JSON.stringify({ sentence: [{ text: "PRIVATE_JOURNAL" }], recentCardIds: ["private"], cardUsage: { mom: 4 } }));
  });
  await page.goto("/pecs-app");
  await page.getByRole("searchbox", { name: "Find a card" }).waitFor();
  const result = await page.evaluate(async () => {
    const { useCardStore } = await import("/src/store/cardStore.ts");
    return { all: Object.entries(localStorage).filter(([key]) => key === "pecs-storage" || key.startsWith("expressly-account-data-v1:") || key === "pecs-interactions-v1"), sentence: useCardStore.getState().sentence, entries: useCardStore.getState().progressEntries, saved: useCardStore.getState().savedPhrases };
  });
  expect(JSON.stringify(result.all)).not.toMatch(/PRIVATE_SENTENCE|PRIVATE_HISTORY|PRIVATE_JOURNAL/);
  expect(result.sentence).toEqual([]);
  expect(result.entries[0]).toMatchObject({ wordCount: 7, cardLabels: [], sentenceText: "" });
  expect(result.saved[0].text).toBe("Deliberately saved");
});

test("live sentence details never enter storage or exports; reopening keeps only counts", async ({ page, context }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.goto("/pecs-app");
  await page.getByRole("searchbox", { name: "Find a card" }).waitFor();
  const result = await page.evaluate(async () => {
    const { useCardStore } = await import("/src/store/cardStore.ts");
    const { createExpresslyData } = await import("/src/lib/accountDataExport.ts");
    const { switchAccountStorage } = await import("/src/lib/accountStorage.ts");
    const card = { ...useCardStore.getState().cards[0], text: "PRIVATE_LIVE_WORDING" };
    useCardStore.setState({ sentence: [card] });
    useCardStore.getState().completeSentence({ keepSentence: true });
    // Exercise the smaller interaction-journal write as well as the full snapshot.
    useCardStore.getState().selectCard(card);
    const live = useCardStore.getState().progressEntries[0].sentenceText;
    const exported = createExpresslyData();
    localStorage.setItem("expressly-active-account-scope-v1", "guest");
    switchAccountStorage("privacy-test");
    return { live, exported, disk: Object.entries(localStorage).filter(([key]) => key === "pecs-storage" || key.startsWith("expressly-account-data-v1:") || key === "pecs-interactions-v1") };
  });
  expect(result.live).toBe("PRIVATE_LIVE_WORDING");
  expect(JSON.stringify(result.disk)).not.toContain("PRIVATE_LIVE_WORDING");
  expect(JSON.stringify(result.exported)).not.toContain("PRIVATE_LIVE_WORDING");
  // Restore the archived guest snapshot into the active slot for a fresh page.
  await page.evaluate(() => {
    localStorage.setItem("pecs-storage", localStorage.getItem("expressly-account-data-v1:guest")!);
    localStorage.setItem("expressly-active-account-scope-v1", "guest");
  });
  const fresh = await context.newPage();
  await fresh.goto("/pecs-app");
  await fresh.getByRole("searchbox", { name: "Find a card" }).waitFor();
  const reopened = await fresh.evaluate(async () => {
    const state = (await import("/src/store/cardStore.ts")).useCardStore.getState();
    return { sentence: state.sentence, entries: state.progressEntries };
  });
  expect(reopened.sentence).toEqual([]);
  expect(reopened.entries).toHaveLength(1);
  expect(reopened.entries[0]).toMatchObject({ wordCount: 1, sentenceText: "", cardLabels: [] });
  await fresh.close();
});

test("session invalidation and page exit clear wording while retaining counts", async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.goto("/pecs-app");
  for (const pageExit of [false, true]) {
    const result = await page.evaluate(async exit => {
      const { useCardStore } = await import("/src/store/cardStore.ts");
      const { clearPrivateSession, privateSessionRevision } = await import("/src/lib/privateSession.ts");
      useCardStore.setState({ sentence: [{ ...useCardStore.getState().cards[0], text: "PRIVATE_SESSION_TEXT" }], progressEntries: [] });
      useCardStore.getState().completeSentence({ keepSentence: true });
      const before = privateSessionRevision();
      if (exit) window.dispatchEvent(new Event("pagehide")); else clearPrivateSession();
      const state = useCardStore.getState();
      return { revisionChanged: privateSessionRevision() > before, sentence: state.sentence, entries: state.progressEntries };
    }, pageExit);
    expect(result.revisionChanged).toBe(true);
    expect(result.sentence).toEqual([]);
    expect(result.entries[0]).toMatchObject({ wordCount: 1, sentenceText: "", cardLabels: [] });
  }
});

test("restoring an old backup cannot reintroduce saved sentence wording", async ({ page }) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.goto("/pecs-app");
  const result = await page.evaluate(async () => {
    const { createExpresslyData } = await import("/src/lib/accountDataExport.ts");
    const { restoreBoardBackup } = await import("/src/lib/boardBackup.ts");
    const { useCardStore } = await import("/src/store/cardStore.ts");
    const backup = createExpresslyData();
    backup.currentSentence = [{ id: useCardStore.getState().cards[0].id, text: "PRIVATE_IMPORTED", category: "actions" }];
    backup.progressHistory = [{ id: "imported", completedAt: new Date().toISOString(), wordCount: 2, cardLabels: ["PRIVATE_IMPORTED"], sentenceText: "PRIVATE_IMPORTED" }];
    restoreBoardBackup(backup);
    return { stored: localStorage.getItem("pecs-storage"), exported: createExpresslyData() };
  });
  expect(result.stored).not.toContain("PRIVATE_IMPORTED");
  expect(result.exported.currentSentence).toEqual([]);
  expect(result.exported.progressHistory[0]).toMatchObject({ wordCount: 2, cardLabels: [], sentenceText: "" });
});

test("dashboard explains counts-only history after reopening", async ({ page }, testInfo) => {
  await seedLearner(page);
  await blockThirdPartyWidgets(page);
  await page.goto("/pecs-app");
  await page.evaluate(async () => {
    const { useCardStore } = await import("/src/store/cardStore.ts");
    useCardStore.setState({ progressEntries: [{ id: "count-only", completedAt: new Date().toISOString(), wordCount: 4, sentenceText: "", cardLabels: [] }] });
  });
  await page.getByRole("button", { name: "Open caregiver area", exact: true }).click();
  await page.getByRole("button", { name: "Continue without a PIN", exact: true }).click();
  await page.getByRole("button", { name: /Parent dashboard/ }).click();
  await page.getByRole("button", { name: "Show messages", exact: true }).click();
  await expect(page.getByText("4 words. Sentence text was not saved.", { exact: true })).toBeVisible();
  await expect(page.getByText("Recorded words", { exact: true })).toBeVisible();
  const screenshot = testInfo.outputPath("privacy-dashboard.png");
  await page.screenshot({ path: screenshot, fullPage: true });
  await testInfo.attach("privacy-dashboard", { path: screenshot, contentType: "image/png" });
});
