import { chromium } from "@playwright/test";

const origin = process.argv[2] || "http://127.0.0.1:8089";
if (!["127.0.0.1", "localhost"].includes(new URL(origin).hostname)) throw new Error("Use a local development server only.");
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.route("https://challenges.cloudflare.com/**", route => route.abort());
  await page.goto(`${origin}/pecs-app`);
  await page.getByRole("heading", { name: "Let’s personalize Expressly" }).waitFor();
  const result = await page.evaluate(async () => {
    const { useCardStore: store } = await import("/src/store/cardStore.ts");
    const optimized = store.persist.getOptions().storage;
    const original = {
      getItem: key => JSON.parse(localStorage.getItem(key)),
      setItem: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
      removeItem: key => localStorage.removeItem(key),
    };
    const results = [];
    for (const [label, storage] of [["full snapshot per tap", original], ["small interaction journal", optimized]]) {
      store.persist.setOptions({ storage });
      store.setState({ onboardingComplete: true, userName: "Synthetic performance test", userImage: "data:image/jpeg;base64," + "A".repeat(1_000_000), sentence: [], customCards: [] });
      const setItem = Storage.prototype.setItem;
      let writes = 0; let charactersWritten = 0;
      Storage.prototype.setItem = function(key, value) {
        if (key.startsWith("pecs-")) { writes++; charactersWritten += value.length; }
        return setItem.call(this, key, value);
      };
      const start = performance.now();
      try {
        const card = store.getState().cards[0];
        for (let index = 0; index < 30; index++) store.getState().selectCard(card);
      } finally { Storage.prototype.setItem = setItem; }
      results.push({ label, tapUpdates: 30, synchronousUpdateMs: +(performance.now() - start).toFixed(2), writes, charactersWritten });
    }
    return results;
  });
  console.log(JSON.stringify({ note: "Isolated synthetic 1 MB photo payload; synchronous store and persistence work, not screen FPS or iPad measurements.", results: result }, null, 2));
} finally { await browser.close(); }
