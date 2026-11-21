// sw.js — service worker : cache-first pour un fonctionnement 100 % hors-ligne.
const CACHE = 'crimp-v19';
const ASSETS = [
  '.', 'index.html', 'manifest.webmanifest',
  'css/fonts.css', 'css/styles.css',
  'js/app.js', 'js/protocols.js', 'js/timer-engine.js', 'js/cues.js',
  'js/adapters.js', 'js/wake-lock.js', 'js/ui.js', 'js/ui-helpers.js', 'js/guide-content.js', 'js/programs-content.js', 'js/load-calc.js', 'js/icons.js', 'js/motion.js',
  'fonts/barlow-condensed-latin-600-normal.woff2',
  'fonts/barlow-condensed-latin-700-normal.woff2',
  'fonts/barlow-condensed-latin-ext-600-normal.woff2',
  'fonts/barlow-condensed-latin-ext-700-normal.woff2',
  'fonts/barlow-latin-400-normal.woff2',
  'fonts/barlow-latin-500-normal.woff2',
  'fonts/barlow-latin-600-normal.woff2',
  'fonts/barlow-latin-ext-400-normal.woff2',
  'fonts/barlow-latin-ext-500-normal.woff2',
  'fonts/barlow-latin-ext-600-normal.woff2',
  'fonts/big-shoulders-display-latin-800-normal.woff2',
  'fonts/big-shoulders-display-latin-900-normal.woff2',
  'fonts/big-shoulders-display-latin-ext-800-normal.woff2',
  'fonts/big-shoulders-display-latin-ext-900-normal.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request).then(resp => {
      const copy = resp.clone();
      caches.open(CACHE).then(c => c.put(event.request, copy)).catch(() => {});
      return resp;
    }).catch(() => caches.match('index.html')))
  );
});
