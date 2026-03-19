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

  // Dispara notificação local solicitada pelo app
  if (event.data?.type === 'NOTIFY_INSTALLMENT') {
    const { title, body, tag } = event.data;
    self.registration.showNotification(title, {
      body,
      tag,
      icon:  '/despesas/icon-192x192.png',
      badge: '/despesas/icon-96x96.png',
      vibrate: [200, 100, 200],
      data: { url: '/despesas/' },
      actions: [
        { action: 'open',    title: 'Ver parcelas' },
        { action: 'dismiss', title: 'Dispensar'    },
      ],
    });
  }
});

// ── PUSH: notificação vinda do servidor (futuro) ──────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;
  const d = event.data.json();
  event.waitUntil(
    self.registration.showNotification(d.title || 'Meu Orçamento', {
      body:    d.body  || '',
      icon:    '/despesas/icon-192x192.png',
      badge:   '/despesas/icon-96x96.png',
      tag:     d.tag   || 'meuorcamento',
      data:    { url: d.url || '/despesas/' },
      vibrate: [200, 100, 200],
    })
  );
});

// ── CLICK NA NOTIFICAÇÃO ──────────────────────────────────────────────
self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'dismiss') return;
  const url = event.notification.data?.url || '/despesas/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes('/despesas/'));
      if (existing) return existing.focus();
      return clients.openWindow(url);
    })
  );
});
