// StepNotifications — Step 7: Notification preferences + finish CTA.

interface StepNotificationsProps {
  notificationPrefs: {
    periodReminders: boolean;
    ovulationAlerts: boolean;
    dailyLogReminder: boolean;
  };
  onChange: (prefs: { periodReminders: boolean; ovulationAlerts: boolean; dailyLogReminder: boolean }) => void;
  onFinish: () => void;
  loading: boolean;
}

const TOGGLES = [
  {
    key: "periodReminders" as const,
    icon: "🔔",
    label: "Period reminders",
    subtitle: "Get notified before your period starts",
    default: true,
  },
  {
    key: "ovulationAlerts" as const,
    icon: "✨",
    label: "Ovulation alerts",
    subtitle: "Know when your fertile window opens",
    default: true,
  },
  {
    key: "dailyLogReminder" as const,
    icon: "📝",
    label: "Daily log reminder",
    subtitle: "Gentle nudge to log how you're feeling",
    default: false,
  },
];

export function StepNotifications({
  notificationPrefs,
  onChange,
  onFinish,
  loading,
}: StepNotificationsProps) {
  const toggle = (key: "periodReminders" | "ovulationAlerts" | "dailyLogReminder") => {
    onChange({ ...notificationPrefs, [key]: !notificationPrefs[key] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[24px] font-bold text-text" style={{ fontFamily: "DM Serif Display, serif" }}>
          Never miss a day
        </h1>
        <p className="mt-2 text-[14px] text-muted">
          We&apos;ll remind you to log and alert you before your period
        </p>
      </div>

      <div className="space-y-3">
        {TOGGLES.map((t) => {
          const active = notificationPrefs[t.key];
          return (
            <div
              key={t.key}
              className="flex items-center justify-between rounded-card border border-border bg-card p-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex-shrink-0 text-[22px]">{t.icon}</span>
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-text">{t.label}</p>
                  <p className="text-[12px] text-muted">{t.subtitle}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => toggle(t.key)}
                aria-label={`Toggle ${t.label}`}
                aria-pressed={active}
                className={`toggle-track flex-shrink-0 ml-3 ${active ? "active" : ""}`}
              >
                <div className="toggle-thumb" />
              </button>
            </div>
          );
        })}
      </div>

      <button
        type="button"
        onClick={onFinish}
        disabled={loading}
        className="w-full rounded-btn bg-primary px-5 py-4 text-[16px] font-bold text-white cursor-pointer transition-colors duration-200 hover:bg-primary-light disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "Setting up…" : "Start tracking →"}
      </button>
    </div>
  );
}
