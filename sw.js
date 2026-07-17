/* Bump CACHE when you change index.html, or the phone keeps the old copy. */
const CACHE = 'ledger-v9';
const ASSETS = ['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png'];

/* New SW installs but WAITS — the page shows an "update" prompt and only
   when the user taps it do we skipWaiting + reload. Controlled, no surprise. */
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
});
self.addEventListener('message', e => { if (e.data === 'SKIP_WAITING') self.skipWaiting(); });

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/* Network-first, cache as fallback: you get updates when online,
   and the app still opens on the MRT with no signal. */
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // Only manage our own assets; let Google (login / Drive API) go straight to network.
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      })
      .catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
