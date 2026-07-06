import { useEffect } from "react";
import { playAlarm } from "../utils/audio";

const REMINDERS_KEY = "atnasya-reminders";
const DAILY_SCHEDULE_KEY = "atnasya-daily-schedule";

const DAILY_SCHEDULE = [
  { id: "morning", time: "08:00", emoji: "🌅", title: "🌅 Morning affirmation", body: "Take a deep breath and set a positive intention." },
  { id: "midday", time: "12:00", emoji: "💡", title: "💡 Midday wellness tip", body: "Hydrate, stretch, and reset for the afternoon." },
  { id: "meditation", time: "16:00", emoji: "🧘", title: "🧘 Meditation time", body: "Even 3 minutes of calm helps." },
  { id: "yoga", time: "18:00", emoji: "🤸", title: "🤸 Yoga break", body: "A short flow can loosen tension." },
];

const firedKeys = new Set<string>();
function clearFired() { firedKeys.clear(); }

function getReminders() {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((r: any) => r && r.id && Array.isArray(r.days) && Array.isArray(r.times) && r.enabled);
  } catch {
    return [];
  }
}

function isDailyScheduleOn() {
  return localStorage.getItem(DAILY_SCHEDULE_KEY) !== "off";
}

export function useNotificationScheduler() {
  useEffect(() => {
    if (typeof Notification === "undefined") return;
    if (Notification.permission === "denied") return;

    const check = () => {
      const now = new Date();
      const currentMin = String(now.getHours()).padStart(2, "0") + ":" + String(now.getMinutes()).padStart(2, "0");
      const today = now.getDay();
      const reminders = getReminders();
      const dailyScheduleOn = isDailyScheduleOn();

      for (const r of reminders) {
        if (!r.days.includes(today) || !r.times.includes(currentMin)) continue;
        if (Notification.permission === "granted") {
          try { new Notification(r.title, { body: `${r.emoji ?? "🔔"} ${r.title}`, icon: "/icons/icon.svg", tag: r.id }); } catch {}
        }
        if (r.alarmEnabled && r.alarmSound && r.alarmSound !== "none") {
          try { playAlarm(r.alarmSound); } catch {}
        }
      }

      if (dailyScheduleOn) {
        for (const slot of DAILY_SCHEDULE) {
          if (typeof slot.time !== "string" || slot.time !== currentMin) continue;
          const key = slot.id + "@" + new Date().toDateString();
          if (firedKeys.has(key)) continue;
          firedKeys.add(key);
          if (Notification.permission === "granted") {
            try { new Notification(slot.title, { body: slot.body, icon: "/icons/icon.svg", tag: "schedule-" + slot.id }); } catch {}
          }
        }
      }
    };

    const interval = setInterval(check, 30000);
    const dateReset = setInterval(clearFired, 86400000);
    return () => { clearInterval(interval); clearInterval(dateReset as any); };
  }, []);
}
