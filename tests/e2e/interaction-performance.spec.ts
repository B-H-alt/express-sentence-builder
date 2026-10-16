import { expect, test } from "@playwright/test";
import { seedLearner, blockThirdPartyWidgets } from "./helpers";

test.beforeEach(async ({ page }) => {
  await seedLearner(page); await blockThirdPartyWidgets(page); await page.goto("/pecs-app");
  await page.getByRole("searchbox", { name: "Find a card" }).waitFor();
});

test("tap saving avoids large photo rewrites and vocabulary references stay stable", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { useCardStore: store } = await import("/src/store/cardStore.ts");
    const { createVocabularySelector } = await import("/src/lib/vocabularySelector.ts");
    const selector = createVocabularySelector();
    store.setState({ userImage: "data:image/jpeg;base64," + "A".repeat(1_000_000) });
    const before = selector(store.getState());
    const card = before[0]; let snapshotWrites = 0; let journalBytes = 0;
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function(key, value) {
      if (key === "pecs-storage") snapshotWrites++;
      if (key === "pecs-interactions-v1") journalBytes += value.length;
      return original.call(this, key, value);
    };
    const start = performance.now();
    try { for (let i = 0; i < 30; i++) store.getState().selectCard(card); }
    finally { Storage.prototype.setItem = original; }
    const sameVocabulary = before === selector(store.getState());
    store.getState().addCustomCard({ text: "New card", category: "people" });
    const changedVocabulary = before !== selector(store.getState());
    return { snapshotWrites, journalBytes, sameVocabulary, changedVocabulary, elapsedMs: performance.now() - start };
  });
  expect(result.snapshotWrites).toBe(0);
  expect(result.journalBytes).toBeLessThan(100_000);
  expect(result.sameVocabulary).toBe(true); expect(result.changedVocabulary).toBe(true);
});

test("last tap survives reopening with its custom photo and chosen alternative", async ({ page }) => {
  const expected = await page.evaluate(async () => {
    const { useCardStore: store } = await import("/src/store/cardStore.ts");
    const canvas = document.createElement("canvas"); canvas.width = canvas.height = 2;
    const photo = canvas.toDataURL("image/png");
    store.getState().addCustomCard({ text: "Dad", category: "people", imageUrl: photo });
    const card = store.getState().customCards.at(-1)!;
    store.getState().selectCard({ ...card, text: "Papa" });
    return { id: card.id, photo };
  });
  const fresh = await page.context().newPage(); await fresh.goto("/pecs-app");
  await fresh.getByRole("searchbox").waitFor();
  const result = await fresh.evaluate(async () => {
    const s = (await import("/src/store/cardStore.ts")).useCardStore.getState();
    return { sentence: s.sentence.map(card => ({ id: card.id, text: card.text, imageUrl: card.imageUrl })), usage: s.customCards.at(-1)?.usage };
  });
  expect(result).toEqual({ sentence: [{ id: expected.id, text: "Papa", imageUrl: expected.photo }], usage: 1 });
  await fresh.close();
});

test("account switch flushes last taps; account deletion does not resurrect them", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { useCardStore: store } = await import("/src/store/cardStore.ts");
    const { switchAccountStorage, clearAccountStorage } = await import("/src/lib/accountStorage.ts");
    switchAccountStorage("account-a");
    store.getState().selectCard(store.getState().cards[0]);
    switchAccountStorage("account-b");
    const archived = JSON.parse(localStorage.getItem("expressly-account-data-v1:user:account-a")!);
    const noJournalAfterSwitch = localStorage.getItem("pecs-interactions-v1") === null;
    switchAccountStorage("account-a");
    clearAccountStorage("account-a");
    return { archivedWords: archived.state.sentence.length, noJournalAfterSwitch, deleted: localStorage.getItem("pecs-storage") === null && localStorage.getItem("pecs-interactions-v1") === null };
  });
  expect(result).toEqual({ archivedWords: 1, noJournalAfterSwitch: true, deleted: true });
});

test("stale and malformed journals cannot override a replaced board", async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { useCardStore: store } = await import("/src/store/cardStore.ts");
    const { boardPersistence } = await import("/src/lib/boardPersistence.ts");
    store.setState({ userName: "Journal test" });
    store.getState().selectCard(store.getState().cards[0]);
    const snapshot = JSON.parse(localStorage.getItem("pecs-storage")!);
    snapshot.state.userName = "Replacement"; snapshot.state.sentence = []; snapshot.boardRevision = "new-snapshot";
    localStorage.setItem("pecs-storage", JSON.stringify(snapshot));
    const stale = boardPersistence.getItem("pecs-storage") as { state: { sentence: unknown[] } };
    const journal = JSON.parse(localStorage.getItem("pecs-interactions-v1")!);
    journal.baseRevision = "new-snapshot"; journal.sentence = [null];
    localStorage.setItem("pecs-interactions-v1", JSON.stringify(journal));
    const malformed = boardPersistence.getItem("pecs-storage") as { state: { sentence: unknown[] } };
    return [stale.state.sentence.length, malformed.state.sentence.length];
  });
  expect(result).toEqual([0, 0]);
});
