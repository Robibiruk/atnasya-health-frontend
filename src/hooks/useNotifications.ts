import { useState, useEffect, useCallback } from "react";
import { playAlarm } from "../utils/audio";

export type NotifPerm = NotificationPermission | "unavailable";

export function useNotifications() {
  const [permission, setPermission] = useState<NotifPerm>(
    typeof Notification !== "undefined" ? Notification.permission : "unavailable"
  );

  useEffect(() => {
    if (typeof Notification === "undefined") return;

    const onChange = () => {
      try {
        setPermission(Notification.permission);
      } catch {}
    };

    onChange();

    // Update on native changes where supported.
    if ((Notification as any).onpermissionchange) {
      (Notification as any).onpermissionchange = onChange;
    }

    const poll = setInterval(onChange, 1000);
    return () => {
      clearInterval(poll);
      if ((Notification as any).onpermissionchange) {
        (Notification as any).onpermissionchange = null;
      }
    };
  }, []);

  const request = useCallback(async () => {
    if (typeof Notification === "undefined") return "unavailable";
    const p = await Notification.requestPermission();
    setPermission(p);
    return p;
  }, []);

  const test = useCallback(
    async (alarmSound: "chime" | "beep" | "soft" | "none" = "none") => {
      if (Notification.permission !== "granted") return;
      try {
        new Notification("Atnasya Test", {
          body: "Notifications ✅",
          icon: "/icons/icon.svg",
          tag: "atnasya-test",
        });
      } catch {}
      try {
        playAlarm(alarmSound);
      } catch {}
    },
    []
  );

  const enabled = permission === "granted";

  return { permission, enabled, request, test };
}
