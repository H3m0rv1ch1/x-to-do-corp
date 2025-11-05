const CACHE_NAME = 'x-to-do-corp-v1.5';
const APP_SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  // Notification icons cached to ensure they load when showing notifications
  '/screenshots/app-preview.png',
  '/screenshots/Img.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(
      keys.map((key) => (key !== CACHE_NAME ? caches.delete(key) : undefined))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  event.respondWith(
    caches.match(request).then((cached) => {
      const networkFetch = fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => cached);

      return cached || networkFetch;
    })
  );
});

// Make notifications clickable: focus existing app window or open a new one
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = (event.notification && event.notification.data && event.notification.data.url) || '/';
  event.waitUntil((async () => {
    try {
      const clientList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      if (clientList && clientList.length > 0) {
        // Focus the first visible client
        for (const client of clientList) {
          try {
            if ('focus' in client) {
              await client.focus();
              return;
            }
          } catch {}
        }
      }
      // No clients – open the app URL
      await self.clients.openWindow(url);
    } catch (e) {
      // Fallback: try to open root
      try { await self.clients.openWindow('/'); } catch {}
    }
  })());
});