self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
    event.waitUntil((async () => {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys
            .filter(key => key.startsWith('offline-cache-'))
            .map(key => caches.delete(key)));
        await self.registration.unregister();
        await self.clients.claim();
    })());
});
