const CACHE_NAME = 'cybermatch-v2';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/base.css',
  './css/hud.css',
  './css/cards.css',
  './css/skins.css',
  './css/modals.css',
  './css/overlays.css',
  './css/controls.css',
  './css/combo.css',
  './css/achievements.css',
  './css/collections.css',
  './css/responsive.css',
  './js/sound.js',
  './js/data.js',
  './js/rank.js',
  './js/game.js',
  './js/collections.js',
  './js/achievements.js',
  './js/ui.js',
];

// Install — cache all assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache-first, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => cached || fetch(event.request))
  );
});
