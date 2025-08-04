self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('fidakune-v1').then((cache) => {
      return cache.addAll([
        '/submit-ideas.html',
        '/manifest.json',
        'https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css'
      ]);
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== 'fidakune-v1') {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
