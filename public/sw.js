/* VexDeals service worker: hashed /assets/ files are cache-first (they never change),
   pages are network-first (always fresh online, cached fallback offline).
   Other origins (images, Firestore) are left to the browser. */
const CACHE = 'vexdeals-v6';

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith('/api/')) return;

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith((async () => {
      const cached = await caches.match(req);
      if (cached) return cached;
      const fresh = await fetch(req);
      if (fresh.ok) (await caches.open(CACHE)).put(req, fresh.clone()).catch(() => {});
      return fresh;
    })());
    return;
  }

  event.respondWith((async () => {
    try {
      const fresh = await fetch(req);
      if (fresh.ok) (await caches.open(CACHE)).put(req, fresh.clone()).catch(() => {});
      return fresh;
    } catch {
      return (await caches.match(req)) || caches.match('/');
    }
  })());
});
