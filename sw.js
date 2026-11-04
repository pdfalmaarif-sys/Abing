/* Abing Mengaji — service worker (agar bisa dipakai offline). Naikkan nomor VERSI setiap kali index.html diubah. */
const VERSI = 'abing-mengaji-v6';
self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSI).then(c => c.addAll(['./', 'index.html'])).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// Ambil dari cache dulu (cepat & offline), lalu perbarui diam-diam di belakang layar.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  e.respondWith(caches.match(req, { ignoreSearch: true }).then(hit => {
    const net = fetch(req).then(res => {
      if (res && res.status === 200 && res.type === 'basic') { const copy = res.clone(); caches.open(VERSI).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => hit || (req.mode === 'navigate' ? caches.match('index.html') : Response.error()));
    return hit || net;
  }));
});
