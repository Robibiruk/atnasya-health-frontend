/* Minimal service worker for Atnasya reminders + alarm playback.
   Persistent notifications after browser tab closed / installed PWA. */

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    (async () => {
      const alarm = event.notification.data && event.notification.data.alarm;
      try {
        const all = await self.registration.getNotifications({ tag: "atnasya-reminder" });
        for (const n of all) n.close();
      } catch {}

      if (alarm) {
        try {
          const opened = await self.clients.openWindow("/");
          if (!opened) {
            await self.clients.matchAll().then((list) => list.forEach((c) => c.postMessage({ type: "play-alarm" })));
          }
        } catch {}
      }
    })()
  );
});

self.addEventListener("message", (event) => {
  if (!event.data || event.data?.type !== "play-alarm") return;
  const title = event.data.title || "Atnasya Reminder";
  const body = event.data.body || "";
  if ("showNotification" in self.registration) {
    self.registration.showNotification(title, {
      body,
      icon: "/icons/icon.svg",
      badge: "/icons/icon.svg",
      tag: "atnasya-reminder",
      renotify: true,
      data: { alarm: true },
    });
  }
});

self.addEventListener("push", (event) => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || "Atnasya Reminder";
  const options = {
    body: data.body || "",
    icon: "/icons/icon.svg",
    badge: "/icons/icon.svg",
    tag: data.tag || "atnasya-reminder",
    renotify: true,
    data: { ...data, alarm: !!data.alarm },
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
