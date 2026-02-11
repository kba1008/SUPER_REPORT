// Nama cache menggunakan identiti baru SUPER REPORT
const CACHE_NAME = 'super-report-cache-v' + Date.now();
const ASSETS_TO_CACHE = [
  '/',
  'index.html',
  'manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'
];

// 1. Install: Simpan aset utama ke dalam cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache SUPER REPORT dibuka');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); 
});

// 2. Activate: Padam cache lama (Inklusif Pro atau versi terdahulu)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Membersihkan cache lama:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// 3. Fetch: Strategi Stale-While-Revalidate
// Memberikan respon pantas dari cache sambil mengemas kini data di belakang tabir.

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});