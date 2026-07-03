// NotificationBanner — dynamic alerts for period reminders, fertile window, medication due.
import { motion, AnimatePresence } from "framer-motion";
import { useCycleStore } from "../../store/cycleStore";

interface NotificationItem {
  id: string;
  emoji: string;
  title: string;
  body: string;
  color: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function NotificationBanner() {
  const currentPhase = useCycleStore((s) => s.currentPhase);
  const prediction = useCycleStore((s) => s.prediction);
  const dayOfCycle = useCycleStore((s) => s.dayOfCycle);

  // Build notifications from cycle state
  const notifications: NotificationItem[] = [];

  if (currentPhase === "menstrual") {
    notifications.push({
      id: "period-active",
      emoji: "🌸",
      title: "Your period is here",
      body: "Take it easy today. Warmth and rest help.",
      color: "var(--color-period)",
    });
  }

  if (currentPhase === "fertile" || currentPhase === "ovulation") {
    notifications.push({
      id: "fertile-window",
      emoji: "🌿",
      title: "Fertile window",
      body: currentPhase === "ovulation" ? "Today is ovulation day — peak fertility." : "You're in your fertile window.",
      color: "var(--color-fertile)",
    });
  }

  if (dayOfCycle && dayOfCycle >= 21 && currentPhase === "luteal") {
    notifications.push({
      id: "pms-window",
      emoji: "🌙",
      title: "PMS window approaching",
      body: "Be gentle with yourself. Magnesium and rest help.",
      color: "var(--color-pms)",
    });
  }

  if (notifications.length === 0) {
    notifications.push({
      id: "no-alerts",
      emoji: "✅",
      title: "All caught up",
      body: "No alerts right now. Keep tracking!",
      color: "var(--color-success)",
    });
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {notifications.slice(0, 2).map((n, i) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: -12, height: 0 }}
            animate={{ opacity: 1, x: 0, height: "auto" }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ delay: i * 0.1, duration: 0.25 }}
            className="rounded-btn flex items-start gap-3 px-4 py-3"
            style={{
              backgroundColor: `color-mix(in srgb, ${n.color} 12%, var(--color-card))`,
              borderLeft: `3px solid ${n.color}`,
            }}
          >
            <span className="text-[18px] mt-0.5">{n.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-text">{n.title}</p>
              <p className="text-[12px] text-muted">{n.body}</p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
