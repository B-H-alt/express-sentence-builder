import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import assert from 'node:assert/strict';
import { chromium } from '@playwright/test';

// Test built assets, not Vite's development server. No audio or paid API calls.
const root = resolve('dist');
let revision = 1;
const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (pathname === '/unavailable-test-asset.js') { res.writeHead(503); res.end(); return; }
    if (pathname.startsWith('/api/')) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"test":true}');
      return;
    }
    let file = resolve(root, `.${pathname}`);
    if (!file.startsWith(`${root}/`)) file = resolve(root, 'index.html');
    try { if (!(await stat(file)).isFile()) file = resolve(root, 'index.html'); }
    catch { file = resolve(root, 'index.html'); }
    let body = await readFile(file);
    if (pathname === '/sw.js' && revision === 2) body = Buffer.from(body.toString().replace(/"version":"([^"]+)"/, '"version":"$1-test-update"'));
    if (pathname === '/sw.js' && revision === 3) body = Buffer.from(body.toString()
      .replace(/"version":"([^"]+)"/, '"version":"$1-test-failed"')
      .replace('"urls":[', '"urls":["/unavailable-test-asset.js",'));
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(500); res.end(); }
});
await new Promise((done) => server.listen(0, '127.0.0.1', done));
const origin = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
try {
  const context = await browser.newContext();
  await context.addInitScript(() => {
    if (!localStorage.getItem('pecs-storage')) {
      localStorage.setItem('expressly-guide-seen', 'true');
      localStorage.setItem('pecs-storage', JSON.stringify({ state: { onboardingComplete: true, userName: 'Offline Test', characterGender: 'girl', currentLevel: 5, showWords: true, language: 'en', volume: 0 }, version: 15 }));
    }
  });
  let page = await context.newPage();
  await page.goto(`${origin}/pecs-app`);
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  const initialCaches = await page.evaluate(() => caches.keys());
  assert.equal(initialCaches.length, 1);
  await page.evaluate(() => fetch('/api/cache-test', { headers: { Authorization: 'Bearer offline-test-only' } }));
  const entries = await page.evaluate(async () => (await (await caches.open((await caches.keys())[0])).keys()).map((request) => new URL(request.url).pathname));
  assert(entries.includes('/index.html'), 'App shell is precached');
  assert(entries.some((entry) => /\.(jpg|png)$/.test(entry)), 'Card images are precached');
  assert(!entries.some((entry) => entry.startsWith('/api/')), 'No API response is cached');
  await context.setOffline(true);
  await page.reload();
  const search = page.getByRole('searchbox', { name: 'Find a card' });
  await search.fill('mom');
  const mom = page.getByRole('button', { name: 'Add Mom to sentence', exact: true });
  await mom.waitFor();
  await page.waitForFunction(() => Array.from(document.images).some((img) => img.alt === 'Mom' && img.complete && img.naturalWidth > 0));
  await mom.click();
  await page.getByRole('button', { name: 'Remove Mom from sentence' }).waitFor();
  await search.fill('turtle');
  await page.getByRole('button', { name: 'Add Turtle to sentence', exact: true }).waitFor();
  await page.waitForFunction(() => Array.from(document.images).some((img) => img.alt === 'Turtle' && img.complete && img.naturalWidth > 0));
  await page.getByRole('button', { name: 'Add Turtle to sentence', exact: true }).click();
  await page.getByRole('button', { name: 'Remove Turtle from sentence' }).waitFor();
  await page.close();
  page = await context.newPage();
  await page.goto(`${origin}/pecs-app`);
  await page.getByRole('searchbox', { name: 'Find a card' }).waitFor();
  console.log(`PASS: offline reload and closed-tab reopening, images, card selection, static-only cache (${entries.length} files).`);

  await context.setOffline(false);
  revision = 2;
  await page.evaluate(async () => { await (await navigator.serviceWorker.getRegistration()).update(); });
  await page.waitForFunction(async () => Boolean((await navigator.serviceWorker.getRegistration()).waiting));
  assert.deepEqual(await page.evaluate(() => caches.keys()), [initialCaches[0], `${initialCaches[0]}-test-update`]);
  assert.equal(await page.evaluate(() => navigator.serviceWorker.controller.state), 'activated');
  await page.close();
  page = await context.newPage();
  await page.goto(`${origin}/pecs-app`);
  await page.waitForFunction(async () => (await caches.keys()).length === 1 && (await caches.keys())[0].endsWith('-test-update'));
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('searchbox', { name: 'Find a card' }).waitFor();
  console.log('PASS: update waits for existing tab, old cache is removed after activation, updated version reopens offline.');
  await context.setOffline(false);
  revision = 3;
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    await new Promise(async (done, reject) => {
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        worker.addEventListener('statechange', () => { if (worker.state === 'redundant') done(); });
      }, { once: true });
      try { await registration.update(); } catch (error) { reject(error); }
    });
  });
  assert.equal(await page.evaluate(async () => Boolean((await navigator.serviceWorker.getRegistration()).waiting)), false);
  await context.setOffline(true);
  await page.reload();
  await page.getByRole('searchbox', { name: 'Find a card' }).waitFor();
  console.log('PASS: failed update preserves the working version and offline reopening.');
  await context.close();
} finally {
  await browser.close();
  await new Promise((done) => server.close(done));
}
