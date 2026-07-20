const CACHE_NAME = 'unit-converter-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// Service Workerのインストール
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Service Workerのアクティベーション
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// ネットワークリクエストのインターセプト
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      // キャッシュがあればそれを返す
      if (response) {
        return response;
      }

      // キャッシュがなければネットワークから取得
      return fetch(event.request).then(response => {
        // HTMLファイルはキャッシュに追加
        if (event.request.url.endsWith('.html')) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseToCache);
          });
        }
        return response;
      }).catch(() => {
        // オフラインの場合、キャッシュから返す
        return caches.match('./index.html');
      });
    })
  );
});
