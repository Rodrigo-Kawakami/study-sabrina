const CACHE = "revisao-v1";

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(["./", "index.html", "manifest.json"])));
});

self.addEventListener("fetch", event => {
  const sameOrigin = new URL(event.request.url).origin === location.origin;
  if (event.request.method !== "GET" || !sameOrigin) return;
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
