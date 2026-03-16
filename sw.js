/* ═══════════════════════════════════════════════════════════════
   MeuOrçamento — sw.js
   Service Worker: cache offline + atualização automática
   ═══════════════════════════════════════════════════════════════ */

const CACHE_NAME  = 'meuorcamento-v1';
const CACHE_URLS  = [
  '/despesas/',
  '/despesas/index.html',
  '/despesas/style.css',
  '/despesas/app.js',
  '/despesas/firebase.js',
  '/despesas/manifest.json',
  '/despesas/icon-192x192.png',
  '/despesas/icon-512x512.png',
];

// ── INSTALL: pré-cacheia os arquivos principais ───────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Cacheando arquivos...');
      return cache.addAll(CACHE_URLS).catch(err => {
        console.warn('[SW] Alguns arquivos não foram cacheados:', err);
      });
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE: limpa caches antigos ───────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => {
          console.log('[SW] Removendo cache antigo:', k);
          return caches.delete(k);
        })
      )
    )
  );
  self.clients.claim();
});

// ── FETCH: network first, cache como fallback ─────────────────────────
self.addEventListener('fetch', event => {
  // Ignora requests do Firebase (sempre online)
  if (event.request.url.includes('firebasejs') ||
      event.request.url.includes('googleapis') ||
      event.request.url.includes('firebaseapp') ||
      event.request.url.includes('gstatic')) {
    return;
  }

  // Ignora requests não-GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Atualiza o cache com a versão mais recente
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Offline: usa cache
        return caches.match(event.request).then(cached => {
          if (cached) return cached;
          // Fallback para index.html em navegação
          if (event.request.mode === 'navigate') {
            return caches.match('/despesas/index.html');
          }
        });
      })
  );
});

// ── MENSAGEM: força atualização ───────────────────────────────────────
self.addEventListener('message', event => {
  if (event.data === 'skipWaiting') self.skipWaiting();
});
