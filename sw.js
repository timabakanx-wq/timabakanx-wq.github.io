// Asie_Telegraph — service worker
// Обновляется сразу при загрузке новой версии
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (event) { event.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (event) {
  let data = {};
  try { data = event.data ? event.data.json() : {}; }
  catch (e) { data = { title: 'Asie_Telegraph', body: event.data ? event.data.text() : '' }; }

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      // Если приложение открыто и видно на экране — НЕ показываем уведомление.
      // Пользователь и так увидит сообщение внутри чата.
      const appVisible = list.some(function (c) { return c.visibilityState === 'visible'; });
      if (appVisible) return;

      const title = data.title || 'Asie_Telegraph';
      const options = {
        body: data.body || 'Новое сообщение',
        icon: '/icons/icon-192.png',
        badge: '/icons/icon-192.png',
        tag: data.tag || 'at-push',
        data: { url: data.url || '/index.html' },
        vibrate: [120, 60, 120],
        renotify: true,
        actions: [{ action: 'open', title: 'Открыть чат' }]
      };
      return self.registration.showNotification(title, options);
    })
  );
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || '/index.html';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
      for (let i = 0; i < list.length; i++) {
        const client = list[i];
        if ('focus' in client) {
          client.focus();
          if ('navigate' in client) { try { client.navigate(target); } catch (e) {} }
          return;
        }
      }
      return clients.openWindow(target);
    })
  );
});
