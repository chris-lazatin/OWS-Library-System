const CACHE = "ows-v2";
const STATIC = [
  "/",
  "/css/main.css",
  "/css/login.css",
  "/pages/dashboard.html",
  "/pages/add-book.html",
  "/pages/lending.html",
  "/pages/book-list.html",
  "/js/login.js",
  "/js/pages/dashboard.js",
  "/js/pages/addBook.js",
  "/js/pages/bookList.js",
  "/js/pages/lending.js",
  "/js/state/store.js",
  "/js/services/firebase.js",
  "/js/services/firestoreService.js",
  "/js/components/layout.js",
  "/js/components/charts.js",
  "/js/components/modal.js",
  "/js/components/notifications.js",
  "/js/components/profileMenu.js",
  "/js/utils/bookOptions.js",
  "/js/utils/html.js",
  "/assets/logo_192 (2).png",
  "/assets/bell.png",
  "/assets/home.png",
  "/assets/book-plus.png",
  "/assets/book-open-cover.png",
  "/assets/list.png",
  "/assets/print.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(STATIC)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (e) => {
  const url = e.request.url;
  if (
    e.request.destination === "document" ||
    url.includes("/css/") ||
    url.includes("/js/") ||
    url.includes("/assets/")
  ) {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request))
    );
  }
});