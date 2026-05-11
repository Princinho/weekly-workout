// public/sw.js — Service Worker for rest timer push notifications
const CACHE = 'wikly-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

// Listen for messages from the app
self.addEventListener('message', (event) => {
    const { type, remaining, duration } = event.data || {};

    if (type === 'TIMER_START') {
        // Clear any existing timer alarm
        if (self._timerTimeout) clearTimeout(self._timerTimeout);
        self._timerDeadline = Date.now() + remaining * 1000;

        self._timerTimeout = setTimeout(() => {
            self.registration.showNotification('Wikly · Rest Complete 💪', {
                body: 'Time to hit your next set!',
                icon: '/icon.png',
                badge: '/icon.png',
                tag: 'rest-timer',
                renotify: true,
                vibrate: [200, 100, 200, 100, 400],
                requireInteraction: false,
                silent: false,
            });
        }, remaining * 1000);
    }

    if (type === 'TIMER_STOP' || type === 'TIMER_RESET') {
        if (self._timerTimeout) {
            clearTimeout(self._timerTimeout);
            self._timerTimeout = null;
        }
    }

    if (type === 'TIMER_ADJUST') {
        // delta in ms added to deadline
        if (self._timerTimeout && self._timerDeadline) {
            clearTimeout(self._timerTimeout);
            self._timerDeadline += event.data.deltaSecs * 1000;
            const left = self._timerDeadline - Date.now();
            if (left > 0) {
                self._timerTimeout = setTimeout(() => {
                    self.registration.showNotification('Wikly · Rest Complete 💪', {
                        body: 'Time to hit your next set!',
                        icon: '/icon.png',
                        badge: '/icon.png',
                        tag: 'rest-timer',
                        renotify: true,
                        vibrate: [200, 100, 200, 100, 400],
                    });
                }, left);
            }
        }
    }
});

// Clicking the notification focuses the app
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    event.waitUntil(
        self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clients => {
            if (clients.length > 0) return clients[0].focus();
            return self.clients.openWindow('/');
        })
    );
});