var cacheName = 'fitnessPWA-v1';
var appShellFiles = [
    '/',
    '/static/assets/dumbbell_32.png',
    '/static/assets/dumbbell_128.png',
    '/static/assets/dumbbell_256.png',
    '/static/assets/favicon.ico',
    '/static/scripts/app.js',
    '/static/stylesheets/home.css',

];

self.addEventListener('install', (e) => {
    console.log('[ServiceWorker] Install');
    e.waitUntil(
        caches.open(cacheName).then((cache) => {
            console.log('[Service Worker] Caching all: app shell and content');
            return cache.addAll(appShellFiles);
        })
    );
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(keyList.map((key) => {
                if (key !== cacheName) {
                    return caches.delete(key);
                }
            }));
        })
    );
});

self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((r) => {
            console.log('[Service Worker] Fetching resource: ' + e.request.url);
            return r || fetch(e.request).then((response) => {
                return caches.open(cacheName).then((cache) => {
                    console.log('[Service Worker] Caching new resource: ' + e.request.url);
                    cache.put(e.request, response.clone());
                    return response;
                });
            });
        })
    );
});

async function updateHome() {
    const articlesCache = await caches.open(cacheName);
    await articlesCache.add('/');
    console.log('updated home');
  }

self.addEventListener('periodicsync', event => {
    if (event.tag === 'fetch-home') {
      event.waitUntil(updateHome());
    }
  });