const CACHE = 'n4study-v11';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './data.js',
  'https://cdn.jsdelivr.net/npm/wanakana@5.3.0/wanakana.min.js'
];

// The app shell is small and changes on every release, so it is fetched
// network-first and only falls back to cache when offline. Previously the
// fetch handler returned the cached copy first, which pinned users to
// whatever app.js they happened to have cached until they manually
// unregistered the service worker.
const SHELL = /\/(index\.html|app\.js|style\.css)$/;

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isShell = isSameOrigin && (req.mode === 'navigate' || SHELL.test(url.pathname));

  // Network-first for the app shell, so a push is picked up on reload.
  if (isShell) {
    e.respondWith(
      fetch(req).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => caches.match(req).then(cached => cached || caches.match('./index.html')))
    );
    return;
  }

  // Cache-first with background refresh for everything else (CDN fonts, images).
  e.respondWith(
    caches.match(req).then(cached => {
      const fetched = fetch(req).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || fetched;
    })
  );
});