/* global self, caches, fetch, URL, Response */
const manifest = /* BUILD_MANIFEST */ null;
const cacheName = `expressly-static-${manifest.version}`;
const allowed = new Set(manifest.urls);

self.addEventListener("install", (event) => {
  // addAll is atomic: an incomplete download never becomes a usable release.
  event.waitUntil(caches.open(cacheName).then((cache) => cache.addAll(manifest.urls)));
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
    if (url.pathname !== "/pecs-app" && url.pathname !== "/pecs-app/") return;
    event.respondWith((async () => {
      try { return await fetch(request); }
      catch {
        const cached = await (await caches.open(cacheName)).match("/index.html");
        return cached || new Response("Connect to the internet once to prepare Expressly for offline use.", { status: 503, headers: { "Content-Type": "text/plain" } });
      }
    })());
    return;
  }
  if (url.search || !allowed.has(url.pathname)) return;
  event.respondWith((async () => {
    const cached = await (await caches.open(cacheName)).match(url.pathname);
    return cached || fetch(request);
  })());
});
