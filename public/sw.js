const CACHE_NAME = 'birria-fusion-v1';
const STATIC_ASSETS = [
  '/',
  '/styles.css',
  '/uploads/1763192867406_birria-fusion-logo.png'
];

// Install - cache static assets only
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(STATIC_ASSETS))
  );
});

// Fetch - online-only for API calls, cache for static assets
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // API calls - always go to network (online-only)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Static assets - try cache first, then network
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});