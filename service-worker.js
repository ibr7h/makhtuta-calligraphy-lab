const CACHE_VERSION = 'makhtuta-pwa-v6-32-beta-2d-glyph-stroke-mapping-2026-10-01-9';
const RUNTIME_CACHE = CACHE_VERSION + '-runtime';

const CORE = [
  './',
  './index.html',
  './brush-engine-v2.html',
  './version.js',
  './pwa-updater.js',
  './manifest.webmanifest',
  './manifest-beta.webmanifest',
  './offline.html',
  './icons/icon.svg',
  './icons/icon-maskable.svg'
];

async function broadcast(message) {
  const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
  for (const client of clients) client.postMessage(message);
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_VERSION);
    let done = 0;
    for (const file of CORE) {
      const request = new Request(file, { cache: 'reload' });
      const response = await fetch(request);
      if (!response.ok) throw new Error('Failed to cache ' + file + ': ' + response.status);
      await cache.put(file, response.clone());
      done += 1;
      await broadcast({ type: 'UPDATE_PROGRESS', done, total: CORE.length, file });
    }
    await broadcast({ type: 'UPDATE_READY', done: CORE.length, total: CORE.length, cache: CACHE_VERSION });
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith('makhtuta-') && key !== CACHE_VERSION && key !== RUNTIME_CACHE)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  const data = event.data || {};
  if (data.type === 'SKIP_WAITING') self.skipWaiting();
  if (data.type === 'GET_UPDATE_STATE' && event.source) {
    event.source.postMessage({
      type: 'UPDATE_STATE',
      cache: CACHE_VERSION,
      total: CORE.length
    });
  }
});

async function networkFirst(request, fallback = './index.html') {
  try {
    const response = await fetch(request);
    if (response && (response.ok || response.type === 'opaque')) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  } catch (err) {
    return (await caches.match(request)) ||
           (await caches.match(fallback)) ||
           (await caches.match('./offline.html'));
  }
}

async function versionNetworkFirst(request) {
  try {
    const fresh = new Request(request, { cache: 'no-store' });
    const response = await fetch(fresh);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put('./version.js', response.clone()).catch(() => {});
    }
    return response;
  } catch (err) {
    return (await caches.match('./version.js')) || Response.error();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request).then(response => {
    if (response && (response.ok || response.type === 'opaque')) {
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  }).catch(() => null);
  return cached || (await network) || Response.error();
}

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // version.js must bypass the app cache so an installed PWA can discover a newer release.
  if (url.origin === self.location.origin && url.pathname.endsWith('/version.js')) {
    event.respondWith(versionNetworkFirst(request));
    return;
  }

  if (request.mode === 'navigate') {
    const fallback = url.pathname.endsWith('/brush-engine-v2.html') ? './brush-engine-v2.html' : './index.html';
    event.respondWith(networkFirst(request, fallback));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(response => {
        if (response && response.ok) {
          caches.open(RUNTIME_CACHE).then(cache => cache.put(request, response.clone())).catch(() => {});
        }
        return response;
      }).catch(() => caches.match('./offline.html')))
    );
    return;
  }

  event.respondWith(staleWhileRevalidate(request));
});
