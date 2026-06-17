/* eslint-disable */
// Self-destroying service worker (tombstone).
//
// This file used to be a hand-written, cache-first service worker. It cached
// navigations (/, /new, /play) forever, which froze the app on stale assets and
// blocked PWA updates. It is no longer registered (see public/index.html).
//
// Devices that already installed the old worker.js still have it controlling
// them, so we can't simply delete this file (a 404 would leave the bad worker in
// place). Instead this version tears itself down: it clears every cache,
// unregisters itself, and reloads open tabs so the Workbox service worker
// (/service-worker.js) takes over with the latest deployment.
//
// Once you're confident existing installs have updated, this file can be deleted.

self.addEventListener('install', () => {
  // Activate immediately, replacing the old cache-first worker.
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Drop every cache this origin created (including the stale entumany-* ones).
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      // Remove this service worker registration.
      await self.registration.unregister();

      // Reload open tabs onto a freshly fetched, network-served page. The new
      // page no longer registers this worker and instead uses /service-worker.js.
      const clients = await self.clients.matchAll({type: 'window'});
      clients.forEach((client) => {
        if ('navigate' in client) {
          client.navigate(client.url).catch(() => {});
        }
      });
    })(),
  );
});
