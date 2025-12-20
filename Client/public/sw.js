// frontend/public/sw.js

self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  console.log('New notification', data);

  const options = {
    body: data.body || '',
    icon: '/alert-img.png',
    badge: '/alert-img.png'
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Notification', options)
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();

  const targetUrl = 'https://e-pathshala-six.vercel.app/app';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      for (const client of clientList) {
        if (client.url.includes('/app') && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
