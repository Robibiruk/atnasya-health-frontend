import { useState, useEffect, useCallback } from "react";
import type { SelfCareReminder } from "../types";

const REMINDERS_KEY = "atnasya-reminders";
const DAILY_SCHEDULE_KEY = "atnasya-daily-schedule";

const defaultReminders: SelfCareReminder[] = [
  { id: "r1", type: "hydration", title: "Drink water", times: ["09:00"], emoji: "💧", days: [0,1,2,3,4,5,6], enabled: true, alarmEnabled: false, alarmSound: "none" },
  { id: "r2", type: "stretch", title: "Stretch break", times: ["14:00"], emoji: "🤸", days: [0,1,2,3,4,5], enabled: false, alarmEnabled: false, alarmSound: "none" },
];

function loadReminders(): SelfCareReminder[] {
  try {
    const raw = localStorage.getItem(REMINDERS_KEY);
    if (!raw) return defaultReminders;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return defaultReminders;
    return parsed.map((r: any) => ({
      ...r,
      times: Array.isArray(r.times) && r.times.length > 0 ? r.times : r.time ? [r.time] : ["12:00"],
      alarmEnabled: typeof r.alarmEnabled === "boolean" ? r.alarmEnabled : false,
      alarmSound: ["chime", "beep", "soft", "none"].includes(r.alarmSound) ? r.alarmSound : "none",
    }));
  } catch {
    return defaultReminders;
  }
}

function loadDailySchedule(): boolean {
  return localStorage.getItem(DAILY_SCHEDULE_KEY) !== "off";
}

export function useReminderStore() {
  const [reminders, setReminders] = useState<SelfCareReminder[]>(loadReminders);
  const [dailyScheduleOn, setDailyScheduleOn] = useState<boolean>(loadDailySchedule);

  useEffect(() => { localStorage.setItem(REMINDERS_KEY, JSON.stringify(reminders)); }, [reminders]);
  useEffect(() => { localStorage.setItem(DAILY_SCHEDULE_KEY, dailyScheduleOn ? "on" : "off"); }, [dailyScheduleOn]);

  const addReminder = useCallback((reminder: SelfCareReminder) => setReminders((p) => [...p, reminder]), []);
  const toggleReminder = useCallback((id: string) => setReminders((p) => p.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r)), []);
  const removeReminder = useCallback((id: string) => setReminders((p) => p.filter((r) => r.id !== id)), []);
  const renameReminder = useCallback((id: string, title: string) => setReminders((p) => p.map((r) => r.id === id ? { ...r, title } : r)), []);
  const updateReminder = useCallback((id: string, updates: Partial<SelfCareReminder>) => setReminders((p) => p.map((r) => r.id === id ? { ...r, ...updates } : r)), []);
  const toggleDaily = useCallback((next?: boolean) => setDailyScheduleOn((p) => (typeof next === "boolean" ? next : !p)), []);

  return { reminders, dailyScheduleOn, setDailyScheduleOn: toggleDaily, addReminder, toggleReminder, removeReminder, renameReminder, updateReminder };
}
