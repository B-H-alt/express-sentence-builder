import { chromium } from "@playwright/test";
import { spawn } from "node:child_process";

// Isolated browser storage only. This never signs in or calls paid features.
const origin = "http://127.0.0.1:8092";
const server = spawn("npm", ["run", "dev", "--", "--host", "127.0.0.1", "--port", "8092", "--strictPort"], { stdio: "ignore" });
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 40; attempt++) {
    try { if ((await fetch(origin)).ok) { ready = true; break; } } catch { /* Server starting. */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!ready) throw new Error("Performance test server did not start.");
  browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(`${origin}/pecs-app`);
  const results = await page.evaluate(async () => {
    const { useCardStore: store } = await import("/src/store/cardStore.ts");
    const baseline = store.getState();
    const card = baseline.cards.find((item) => item.text === "Dad");
    const run = (combined) => {
      store.setState(baseline);
      let notifications = 0;
      let writes = 0;
      const unsubscribe = store.subscribe(() => notifications++);
      const original = Storage.prototype.setItem;
      Storage.prototype.setItem = function (key, value) {
        if (key === "pecs-storage") writes++;
        return original.call(this, key, value);
      };
      const start = performance.now();
      try {
        for (let index = 0; index < 30; index++) {
          if (combined) store.getState().selectCard(card);
          else {
            store.getState().addToSentence(card);
            store.getState().incrementUsage(card.id);
          }
        }
      } finally {
        Storage.prototype.setItem = original;
        unsubscribe();
      }
      return {
        notifications, writes,
        elapsedMs: Math.round((performance.now() - start) * 100) / 100,
        words: store.getState().sentence.length,
        usage: store.getState().cards.find((item) => item.id === card.id).usage,
        recent: store.getState().recentCardIds,
      };
    };
    return { previous: run(false), optimized: run(true) };
  });
  console.log(JSON.stringify(results, null, 2));
  const { previous, optimized } = results;
  if (previous.words !== optimized.words || previous.usage !== optimized.usage || JSON.stringify(previous.recent) !== JSON.stringify(optimized.recent)) {
    throw new Error("Card selection changed saved state.");
  }
  if (optimized.writes !== 30 || optimized.notifications !== 30) throw new Error("Each selection must produce exactly one update and write.");
  console.log("PASS: selection state matches; notifications and storage writes reduced by 50%. Timings are diagnostic, not an iPad speed guarantee.");
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
