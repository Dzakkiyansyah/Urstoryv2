const CACHE_NAME = "urstory-v1";

const URLS_TO_CACHE = [
  "/",
  "/index.html",
  "/app.bundle.js",
  "/app.css",
  "/favicon.png",
  "/images/logo.png",
  "/images/logo-192.png",
  "/images/logo-512.png",
  "https://fonts.googleapis.com/css2?family=Nunito:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&family=Quicksand:wght@500;600;700&display=swap",
  "https://fonts.gstatic.com/s/nunito/v26/XRXV3I6Li01BKofINeaB.woff2",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css",
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/webfonts/fa-solid-900.woff2",
];

self.addEventListener("install", (event) => {
  console.log("Service Worker: Menginstall...");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Service Worker: Membuka cache dan menyimpan App Shell");
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => {
        console.log(
          "Service Worker: Installasi selesai. Service worker siap digunakan."
        );
        self.skipWaiting();
      })
      .catch((error) => {
        console.error(
          "Service Worker: Gagal menyimpan cache saat installasi:",
          error
        );
      })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request);
    })
  );
});

self.addEventListener("activate", (event) => {
  console.log("Service Worker: Mengaktifkan...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Service Worker: Menghapus cache lama:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener("push", (event) => {
  console.log("Service Worker: Menerima push notification.");

  const notificationData = event.data.json();
  const { title, options } = notificationData;

  const showNotification = self.registration.showNotification(title, options);
  event.waitUntil(showNotification);
});
