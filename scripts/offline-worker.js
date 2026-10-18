/* global self, caches, fetch, URL, Response, AbortController, setTimeout, clearTimeout */
const manifest = /* BUILD_MANIFEST */ null;
const cacheName = `expressly-static-${manifest.version}`;
const allowed = new Set(manifest.urls);

self.addEventListener("install", (event) => {
  // Reuse only content-hashed assets, never an old index or unversioned public file.
  // At most three low-priority downloads compete with foreground communication.
  event.waitUntil((async () => {
    const cache = await caches.open(cacheName);
    const previous = (await caches.keys()).filter(name => name.startsWith("expressly-static-") && name !== cacheName);
    let cursor = 0;
    let failure = null;
    await Promise.all(Array.from({ length: 3 }, async () => {
      while (!failure && cursor < manifest.urls.length) {
        const path = manifest.urls[cursor++];
        try {
          let response;
          if (path.startsWith("/assets/")) {
            for (const name of previous) {
              response = await (await caches.open(name)).match(path);
              if (response) break;
            }
          }
          response = response || await fetch(path, { priority: "low" });
          if (!response.ok) throw new Error("Offline asset unavailable");
          await cache.put(path, response);
        } catch (error) { failure = error; }
      }
    }));
    if (failure) {
      // Never activate partial vocabulary or remove the previous working release.
      await caches.delete(cacheName);
      throw failure;
    }
  })());
  // Let existing tabs finish with their current version. No forced refresh.
});

self.addEventListener("activate", (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name.startsWith("expressly-static-") && name !== cacheName).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const url = new URL(request.url);
  // Account traffic, API responses, remote images, and authenticated requests never enter this cache.
  if (request.method !== "GET" || url.origin !== self.location.origin || request.headers.has("authorization") || url.pathname.startsWith("/api/")) return;
  if (request.mode === "navigate") {
    if (!["/", "/pecs-app", "/pecs-app/"].includes(url.pathname)) return;
    event.respondWith((async () => {
      const cached = await (await caches.open(cacheName)).match("/index.html");
      const controller = new AbortController();
      const timeout = cached ? setTimeout(() => controller.abort(), 4000) : null;
      try {
        const response = await fetch(request, { signal: controller.signal });
        return cached && response.status >= 500 ? cached : response;
      }
      catch {
        return cached || new Response("Connect to the internet once to prepare Expressly for offline use.", { status: 503, headers: { "Content-Type": "text/plain" } });
      }
      finally { if (timeout) clearTimeout(timeout); }
    })());
    return;
  }
  if (url.search || !allowed.has(url.pathname)) return;
  event.respondWith((async () => {
    const cached = await (await caches.open(cacheName)).match(url.pathname);
    return cached || fetch(request);
  })());
});
