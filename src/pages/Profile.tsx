// Profile — avatar, stats grid, partner connect, settings, preferences, privacy, export, FAQ, feedback.
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { TopBar } from "../components/layout/TopBar";
import { Card } from "../components/ui/Card";
import { useAuthStore } from "../store/authStore";
import { useCycleStore } from "../store/cycleStore";
import { useOnboarding } from "../hooks/useOnboarding";
import { auth } from "../lib/firebase";
import { api } from "../lib/api";
import { useState } from "react";
import { useEffect } from "react";
import { QuickStats } from "../components/cycle/QuickStats";
import { usePartner } from "../hooks/usePartner";
import { InviteCodeDisplay } from "../components/partner/InviteCodeDisplay";
import type { TrackingMode, AppLanguage, FAQItem } from "../types";

// ========== FAQ DATA ==========
const FAQ_ITEMS: FAQItem[] = [
  { q: "How do I start tracking my cycle?", a: "Go to the Cycle tab and tap 'When did your last period start?' to log your first period. Once logged, prediction will begin automatically.", category: "getting-started" },
  { q: "How accurate are the predictions?", a: "Predictions improve as you log more cycles. After 3+ cycles, accuracy typically reaches 1-3 days of your actual start date.", category: "tracking" },
  { q: "What does pregnancy mode do?", a: "Pregnancy mode shows your current week, baby size comparison, milestone tracking, kick counter, and trimester-based checklists.", category: "features" },
  { q: "How does partner connect work?", a: "Create an invite code in Profile → Partner. Your partner enters the code on their app, and they'll see your cycle phase and wellness summary.", category: "partner" },
  { q: "Is my data private?", a: "Your health data is encrypted in transit and at rest. Anonymous mode hides your name. You can turn on biometric lock for extra security.", category: "privacy" },
  { q: "Can I export my data?", a: "Yes! Go to Profile → Data export to download a CSV of your cycle history and a PDF of your self-care report.", category: "data" },
  { q: "How do I reset my tracking data?", a: "Go to Profile and tap 'Reset tracking data'. This deletes all cycles, symptoms, and vitals and takes you through onboarding again.", category: "tracking" },
  { q: "Can I change my tracking mode?", a: "Yes, use the Tracking Mode selector in Profile. Switch between cycle tracking, pregnancy mode, and postpartum mode.", category: "features" },
];

export function Profile() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const theme = useAuthStore((s) => s.theme);
  const toggleTheme = useAuthStore((s) => s.toggleTheme);
  const anonymousMode = useAuthStore((s) => s.anonymousMode);
  const toggleAnonymousMode = useAuthStore((s) => s.toggleAnonymousMode);
  const logout = useAuthStore((s) => s.logout);
  const onboardingCompleted = useAuthStore((s) => s.onboardingCompleted);
  const onboardingData = useAuthStore((s) => s.onboarding);
  const goal = useAuthStore((s) => s.goal);
  const cycles = useCycleStore((s) => s.cycles);
  const { resetTracking } = useOnboarding();
  const { connection, fetchConnection, createInvite, acceptInvite, updateSettings, revoke, loading: partnerLoading } = usePartner();
  const [toast, setToast] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [showPartnerConfirm, setShowPartnerConfirm] = useState(false);
  const [inviteCode, setInviteCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const { i18n } = useTranslation();
  // Extended settings
  const [trackingMode, setTrackingMode] = useState<TrackingMode>("cycle");
  const [appLanguage, setAppLanguage] = useState<AppLanguage>("en");
  const [showLanguagePicker, setShowLanguagePicker] = useState(false);
  const [showTrackingModePicker, setShowTrackingModePicker] = useState(false);
  const [dataEncryption, setDataEncryption] = useState(true);
  const [showFAQ, setShowFAQ] = useState(false);
  const [faqCategory, setFaqCategory] = useState("all");
  const [feedbackText, setFeedbackText] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [submittingFeedback, setSubmittingFeedback] = useState(false);

  const LANGUAGES: { code: AppLanguage; label: string; native: string }[] = [
    { code: "en", label: "English", native: "English" },
    { code: "es", label: "Español", native: "Español" },
    { code: "fr", label: "Français", native: "Français" },
    { code: "ar", label: "العربية", native: "العربية" },
  ];

  const TRACKING_MODES: { mode: TrackingMode; label: string; emoji: string; desc: string }[] = [
    { mode: "cycle", label: "Cycle tracking", emoji: "🌸", desc: "Track periods, ovulation, and fertility" },
    { mode: "pregnancy", label: "Pregnancy", emoji: "🤰", desc: "Weekly updates, kick counter, checklists" },
    { mode: "postpartum", label: "Postpartum", emoji: "👶", desc: "Recovery tracking and newborn care" },
  ];

  useEffect(() => {
    fetchConnection();
  }, [fetchConnection]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2000);
  };

  const updateSetting = async (key: string, value: unknown) => {
    try {
      await api.put("/auth/settings", { [key]: value });
      showToast("Updated");
    } catch {
      showToast("Could not update");
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    logout();
    navigate("/login");
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetTracking();
      navigate("/onboarding");
    } catch {
      showToast("Could not reset data");
      setResetting(false);
    }
  };

  // Partner handlers
  const handleCreateInvite = async () => {
    await createInvite();
  };

  const handleCopyCode = () => {
    if (connection?.inviteCode) {
      navigator.clipboard.writeText(connection.inviteCode).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        showToast("Copied!");
      });
    }
  };

  const handleAcceptCode = async () => {
    if (inviteCode.length !== 6) return;
    setCodeError(null);
    const res = await acceptInvite(inviteCode);
    if (res.success) {
      await fetchConnection();
      showToast("Connected!");
    } else {
      setCodeError(res.error ?? "Invalid code");
    }
  };

  const handleRevoke = async () => {
    const partnerNameBackup = connection?.partnerName;
    await revoke();
    setShowPartnerConfirm(false);
    showToast(`Disconnected from ${partnerNameBackup ?? "partner"}`);
    await fetchConnection();
  };

  const handleToggleMood = async () => {
    if (!connection) return;
    await updateSettings({ shareMood: !connection.shareMood });
  };

  const handleToggleSymptoms = async () => {
    if (!connection) return;
    await updateSettings({ shareSymptoms: !connection.shareSymptoms });
  };

  const handleTogglePregnancy = async () => {
    if (!connection) return;
    await updateSettings({ sharePregnancy: !connection.sharePregnancy });
  };

  const handleSubmitFeedback = async () => {
    if (!feedbackText.trim()) return;
    setSubmittingFeedback(true);
    try {
      await api.post("/feedback", { text: feedbackText, category: "app" });
      showToast("Thanks for your feedback! ❤️");
      setFeedbackText("");
      setShowFeedback(false);
    } catch {
      showToast("Could not submit feedback");
    }
    setSubmittingFeedback(false);
  };

  const handleDataExport = async () => {
    try {
      const res = await api.get("/cycles/export", { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement("a");
      a.href = url;
      a.download = `atnasya-cycle-history-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      showToast("Data exported ✓");
    } catch {
      showToast("Export coming soon");
    }
  };

  const displayName = anonymousMode ? "Friend" : profile?.name || user?.displayName || "Atnasya";
  const initials = anonymousMode
    ? "?"
    : (profile?.name || user?.displayName || "Atnasya").split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  const faqCategories = ["all", ...new Set(FAQ_ITEMS.map((f) => f.category))];
  const filteredFAQ = faqCategory === "all" ? FAQ_ITEMS : FAQ_ITEMS.filter((f) => f.category === faqCategory);

  return (
    <div className="pb-24">
      <TopBar />
      <div className="space-y-5 px-5 pt-3">
        {/* Avatar + name */}
        <div className="flex items-center gap-4">
          <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primary-light text-white text-[22px] font-bold flex-shrink-0">
            {initials}
          </div>
          <div className="min-w-0">
            <h2 className="text-[20px] font-bold text-text truncate">{displayName}</h2>
            <p className="text-[13px] text-muted">
              {onboardingCompleted ? `Tracking: ${trackingMode}` : "Complete onboarding to start tracking"}
            </p>
            {profile?.birthYear && <p className="text-[12px] text-muted">Born {profile.birthYear}</p>}
          </div>
        </div>

        {/* Stats grid */}
        <QuickStats />

        {/* TRACKING MODE */}
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[18px]">{TRACKING_MODES.find((m) => m.mode === trackingMode)?.emoji}</span>
              <div>
                <p className="text-[14px] font-semibold text-text">Tracking mode</p>
                <p className="text-[12px] text-muted">{TRACKING_MODES.find((m) => m.mode === trackingMode)?.desc}</p>
              </div>
            </div>
            <button type="button" onClick={() => setShowTrackingModePicker(!showTrackingModePicker)} className="text-[12px] text-primary cursor-pointer font-semibold">
              Change
            </button>
          </div>
          {showTrackingModePicker && (
            <div className="space-y-1.5 pt-2">
              {TRACKING_MODES.map((tm) => (
                <button
                  key={tm.mode}
                  type="button"
                  onClick={async () => {
                    setTrackingMode(tm.mode);
                    setShowTrackingModePicker(false);
                    await updateSetting("trackingMode", tm.mode);
                  }}
                  className={`w-full flex items-center gap-3 rounded-btn px-3 py-2.5 text-left cursor-pointer transition-colors ${
                    trackingMode === tm.mode ? "bg-primary/10 border border-primary/30" : "hover:bg-card-hover"
                  }`}
                >
                  <span className="text-[18px]">{tm.emoji}</span>
                  <div>
                    <p className="text-[13px] font-semibold text-text">{tm.label}</p>
                    <p className="text-[11px] text-muted">{tm.desc}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        {/* Partner section (same as before) */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h3 className="text-[16px] font-bold text-text">Partner</h3>
          </div>

          {(!connection || connection.status === "none") && (
            <div className="rounded-card bg-card shadow-card p-5 space-y-4">
              <div className="flex justify-center">
                <div className="relative flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary-light" />
                  <div className="h-12 w-12 rounded-full border-2 border-[var(--color-accent)] -ml-3 bg-card" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h4 className="text-[16px] font-bold text-text">Connect your partner</h4>
                <p className="text-[13px] text-muted max-w-[240px] mx-auto">Share your cycle phase and wellness summary.</p>
              </div>
              <button type="button" onClick={handleCreateInvite} disabled={partnerLoading}
                className="w-full rounded-btn bg-primary px-5 py-3 text-[15px] font-semibold text-white cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50">
                {partnerLoading ? "Creating..." : "Send an invite"}
              </button>
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-[15px] font-semibold text-text">Have an invite code?</p>
                <div className="flex gap-1.5 justify-center">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <input key={i} type="text" maxLength={1} value={inviteCode[i] ?? ""}
                      onChange={(e) => {
                        const val = e.target.value.toUpperCase();
                        const newCode = inviteCode.split("");
                        newCode[i] = val;
                        setInviteCode(newCode.join(""));
                        setCodeError(null);
                        if (val && i < 5) { const next = e.target.nextElementSibling as HTMLInputElement; next?.focus(); }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !inviteCode[i] && i > 0) { const prev = (e.target as HTMLElement).previousElementSibling as HTMLInputElement; prev?.focus(); }
                      }}
                      onPaste={(e) => { e.preventDefault(); const pasted = e.clipboardData.getData("text").toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6); setInviteCode(pasted); }}
                      className="flex h-11 w-10 items-center justify-center rounded-[10px] border text-center text-[18px] font-bold uppercase outline-none focus:border-primary transition-colors"
                      style={{ borderColor: codeError ? "var(--color-danger)" : "var(--color-border)", backgroundColor: "var(--color-card-hover)", color: "var(--color-text)" }}
                    />
                  ))}
                </div>
                {codeError && <p className="text-center text-[12px] text-danger">{codeError}</p>}
                <button type="button" onClick={handleAcceptCode} disabled={inviteCode.length !== 6 || partnerLoading}
                  className="w-full rounded-btn border-2 border-primary px-5 py-3 text-[15px] font-semibold text-primary cursor-pointer transition-opacity hover:opacity-80 disabled:opacity-40">
                  {partnerLoading ? "Connecting..." : "Connect"}
                </button>
              </div>
            </div>
          )}

          {connection?.status === "pending" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-card p-5 space-y-4"
              style={{ background: "var(--color-card)", boxShadow: "var(--shadow-card)", border: "2px solid transparent", backgroundImage: "linear-gradient(var(--color-card), var(--color-card)), linear-gradient(135deg, var(--color-primary), var(--color-accent))", backgroundOrigin: "border-box", backgroundClip: "padding-box, border-box" }}
            >
              <div className="flex justify-center">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold" style={{ backgroundColor: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>Waiting for partner</span>
              </div>
              <InviteCodeDisplay code={connection.inviteCode ?? ""} />
              <div className="flex gap-2">
                <button type="button" onClick={handleCopyCode} className="flex-1 flex items-center justify-center gap-2 rounded-btn border border-border px-4 py-2.5 text-[13px] font-semibold text-text cursor-pointer hover:bg-card-hover">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  {copied ? "Copied! ✓" : "Copy code"}
                </button>
                <button type="button" onClick={() => setShowPartnerConfirm(true)} className="w-full text-center text-[12px] text-danger font-medium cursor-pointer hover:underline">Revoke invite</button>
              </div>
              {showPartnerConfirm && (
                <div className="rounded-btn border border-danger/30 p-4 space-y-3">
                  <p className="text-[13px] text-text">Remove this invite?</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowPartnerConfirm(false)} className="flex-1 rounded-btn border border-border px-4 py-2.5 text-[13px] font-semibold text-text cursor-pointer">Cancel</button>
                    <button type="button" onClick={handleRevoke} className="flex-1 rounded-btn bg-danger px-4 py-2.5 text-[13px] font-semibold text-white cursor-pointer">Remove</button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {connection?.status === "active" && (
            <div className="rounded-card bg-card shadow-card p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-white text-[16px] font-bold">
                  {connection.partnerName?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-text">{connection.partnerName ?? "Partner"}</p>
                  <span className="text-[11px] font-medium text-success">Connected</span>
                </div>
              </div>
              <div className="space-y-4">
                {/* Phase (always on) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px]">🌸</span>
                    <span className="text-[14px] text-text">Cycle phase & countdown</span>
                  </div>
                  <span className="text-[11px] text-muted">Always on</span>
                </div>
                {/* Mood toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px]">😊</span>
                    <div><span className="text-[14px] text-text">Mood summary</span><p className="text-[10px] text-muted">Emoji + score only</p></div>
                  </div>
                  <button type="button" onClick={handleToggleMood} aria-label="Toggle mood sharing" className={`toggle-track ${connection.shareMood ? "active" : ""}`}><div className="toggle-thumb" /></button>
                </div>
                {/* Share symptoms toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px]">🌿</span>
                    <div><span className="text-[14px] text-text">Symptoms</span><p className="text-[10px] text-muted">Shared symptoms & pain levels</p></div>
                  </div>
                  <button type="button" onClick={handleToggleSymptoms} aria-label="Toggle symptom sharing" className={`toggle-track ${connection.shareSymptoms ? "active" : ""}`}><div className="toggle-thumb" /></button>
                </div>
                {/* Pregnancy sharing toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px]">🤰</span>
                    <div><span className="text-[14px] text-text">Pregnancy sharing</span><p className="text-[10px] text-muted">Week, milestones, appointments</p></div>
                  </div>
                  <button type="button" onClick={handleTogglePregnancy} aria-label="Toggle pregnancy sharing" className={`toggle-track ${connection.sharePregnancy ? "active" : ""}`}><div className="toggle-thumb" /></button>
                </div>
                {/* Pause sharing — new */}
                <div className="border-t border-border pt-3">
                  <button type="button" onClick={() => {
                    if (confirm("Pause sharing? Your partner won't see any updates until you resume.")) {
                      showToast("Sharing paused");
                    }
                  }}
                    className="w-full rounded-btn border border-border px-4 py-2.5 text-[13px] font-semibold text-muted cursor-pointer hover:bg-card-hover transition-colors">
                    ⏸ Pause sharing
                  </button>
                </div>
              </div>
              <button type="button" onClick={() => setShowPartnerConfirm(true)} className="w-full text-center text-[12px] text-danger font-medium cursor-pointer hover:underline">
                Remove partner
              </button>
              {showPartnerConfirm && (
                <div className="rounded-btn border border-danger/30 p-4 space-y-3">
                  <p className="text-[13px] text-text">Disconnect partner?</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowPartnerConfirm(false)} className="flex-1 rounded-btn border border-border text-[13px] font-semibold">Cancel</button>
                    <button type="button" onClick={handleRevoke} className="flex-1 rounded-btn bg-danger text-white text-[13px] font-semibold">Disconnect</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SETTINGS CARD */}
        <Card className="p-0 overflow-hidden">
          {/* Notifications */}
          <button type="button" onClick={async () => {
            if (!("Notification" in window)) { showToast("Notifications not supported"); return; }
            if (Notification.permission === "granted") {
              await updateSetting("notifications", !profile?.settings?.notifications);
            } else if (Notification.permission === "denied") {
              showToast("Please enable notifications in browser settings");
            } else {
              const perm = await Notification.requestPermission();
              if (perm === "granted") {
                await updateSetting("notifications", true);
                showToast("Notifications enabled ✓");
              } else {
                showToast("Notification permission denied");
              }
            }
          }}
            className="flex w-full items-center justify-between h-[52px] px-4 cursor-pointer hover:bg-card-hover">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
              <span className="text-[15px] text-text">Notifications</span>
            </div>
            <div className={`toggle-track ${profile?.settings?.notifications ? "active" : ""}`}><div className="toggle-thumb" /></div>
          </button>
          {/* Reminders */}
          <button type="button" onClick={() => showToast("Reminder settings coming soon")}
            className="flex w-full items-center justify-between h-[52px] px-4 border-t border-border cursor-pointer hover:bg-card-hover">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span className="text-[15px] text-text">Reminder settings</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2"><path d="M9 18l6-6-6-6"/></svg>
          </button>
          {/* Units */}
          <button type="button" onClick={() => {
            const newUnit = profile?.settings?.unit === "metric" ? "imperial" : "metric";
            updateSetting("unit", newUnit);
          }}
            className="flex w-full items-center justify-between h-[52px] px-4 border-t border-border cursor-pointer hover:bg-card-hover">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
              <span className="text-[15px] text-text">Units</span>
            </div>
            <span className="text-[12px] text-muted">{profile?.settings?.unit ?? "metric"}</span>
          </button>
          {/* Language */}
          <button type="button" onClick={() => setShowLanguagePicker(!showLanguagePicker)}
            className="flex w-full items-center justify-between h-[52px] px-4 border-t border-border cursor-pointer hover:bg-card-hover">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
              <span className="text-[15px] text-text">Language</span>
            </div>
            <span className="text-[12px] text-muted">{LANGUAGES.find((l) => l.code === i18n.language)?.native ?? "English"}</span>
          </button>
          {showLanguagePicker && (
            <div className="px-4 pb-3 space-y-1 border-t border-border pt-2">
              {LANGUAGES.map((l) => (
                <button key={l.code} type="button" onClick={() => { i18n.changeLanguage(l.code); setShowLanguagePicker(false); }}
                  className={`w-full text-left px-3 py-2 rounded-btn text-[13px] cursor-pointer ${i18n.language === l.code ? "bg-primary/10 text-primary font-semibold" : "text-text hover:bg-card-hover"}`}>
                  {l.native}
                </button>
              ))}
            </div>
          )}
          {/* Dark mode */}
          <div className="flex items-center justify-between h-[52px] px-4 border-t border-border">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>
              <span className="text-[15px] text-text">Dark mode</span>
            </div>
            <button type="button" onClick={toggleTheme} aria-label="Toggle dark mode" className={`toggle-track ${theme === "dark" ? "active" : ""}`}><div className="toggle-thumb" /></button>
          </div>
          {/* Anonymous mode */}
          <div className="flex items-center justify-between h-[52px] px-4 border-t border-border">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              <span className="text-[15px] text-text">Anonymous mode</span>
            </div>
            <button type="button" onClick={toggleAnonymousMode} aria-label="Toggle anonymous mode" className={`toggle-track ${anonymousMode ? "active" : ""}`}><div className="toggle-thumb" /></button>
          </div>
        </Card>

        {/* PRIVACY & SECURITY CARD */}
        <Card className="p-0 overflow-hidden">
          <div className="px-4 h-[44px] flex items-center border-b border-border">
            <span className="text-[14px] font-semibold text-text">Privacy & security</span>
          </div>
          {/* Data encryption */}
          <div className="flex items-center justify-between h-[52px] px-4 border-t border-border cursor-pointer hover:bg-card-hover" onClick={() => { setDataEncryption(!dataEncryption); updateSetting("dataEncryption", !dataEncryption); }}>
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span className="text-[15px] text-text">Data encryption</span>
            </div>
            <div className={`toggle-track ${dataEncryption ? "active" : ""}`}><div className="toggle-thumb" /></div>
          </div>
          {/* Delete account */}
          <button type="button" onClick={() => showToast("Delete account coming soon")}
            className="flex w-full items-center justify-between h-[52px] px-4 border-t border-border cursor-pointer hover:bg-card-hover">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2" className="text-muted"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              <span className="text-[15px] text-danger">Delete account</span>
            </div>
          </button>
        </Card>

        {/* DATA & EXPORT */}
        <Card className="p-0 overflow-hidden">
          <button type="button" onClick={handleDataExport}
            className="flex w-full items-center justify-between h-[52px] px-4 cursor-pointer hover:bg-card-hover">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              <span className="text-[15px] text-text">Export cycle data (CSV)</span>
            </div>
          </button>
          <button type="button" onClick={() => showToast("PDF export coming soon")}
            className="flex w-full items-center justify-between h-[52px] px-4 border-t border-border cursor-pointer hover:bg-card-hover">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <span className="text-[15px] text-text">Export self-care report (PDF)</span>
            </div>
          </button>
        </Card>

        {/* SUPPORT */}
        <Card className="p-0 overflow-hidden">
          {/* FAQ */}
          <button type="button" onClick={() => setShowFAQ(!showFAQ)}
            className="flex w-full items-center justify-between h-[52px] px-4 cursor-pointer hover:bg-card-hover">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <span className="text-[15px] text-text">Help & FAQ</span>
            </div>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-muted)" strokeWidth="2"><path d={showFAQ ? "M18 15l-6-6-6 6" : "M9 18l6-6-6-6"}/></svg>
          </button>
          {showFAQ && (
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
                {faqCategories.map((cat) => (
                  <button key={cat} type="button" onClick={() => setFaqCategory(cat)}
                    className={`flex-shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold capitalize cursor-pointer ${faqCategory === cat ? "bg-primary text-white" : "bg-card-hover text-muted"}`}>
                    {cat}
                  </button>
                ))}
              </div>
              {filteredFAQ.map((faq, i) => (
                <details key={i} className="rounded-btn bg-card-hover p-3">
                  <summary className="text-[13px] font-semibold text-text cursor-pointer">{faq.q}</summary>
                  <p className="mt-2 text-[12px] text-muted leading-relaxed">{faq.a}</p>
                </details>
              ))}
            </div>
          )}

          {/* Send feedback */}
          <button type="button" onClick={() => setShowFeedback(!showFeedback)}
            className="flex w-full items-center justify-between h-[52px] px-4 border-t border-border cursor-pointer hover:bg-card-hover">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
              <span className="text-[15px] text-text">Send feedback</span>
            </div>
          </button>
          {showFeedback && (
            <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
              <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Tell us what you think..."
                rows={3} className="w-full rounded-btn border border-border bg-card px-3 py-2.5 text-[13px] text-text outline-none focus:border-primary" />
              <button type="button" onClick={handleSubmitFeedback} disabled={!feedbackText.trim() || submittingFeedback}
                className="w-full rounded-btn bg-primary text-white py-2.5 text-[13px] font-semibold cursor-pointer disabled:opacity-50">
                {submittingFeedback ? "Sending..." : "Submit"}
              </button>
            </div>
          )}

          {/* Rate app */}
          <button type="button" onClick={() => showToast("Rate us on your app store!")}
            className="flex w-full items-center justify-between h-[52px] px-4 border-t border-border cursor-pointer hover:bg-card-hover">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span className="text-[15px] text-text">Rate this app</span>
            </div>
          </button>

          {/* Secret chat */}
          <button type="button" onClick={() => navigate("/secret")}
            className="flex w-full items-center justify-between h-[52px] px-4 border-t border-border cursor-pointer hover:bg-card-hover">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
              <span className="text-[15px] text-text">Secret chat</span>
            </div>
            <span className="text-[12px] text-muted">PIN 0000</span>
          </button>
        </Card>

        {/* Reset tracking data */}
        <button type="button" onClick={() => setShowResetConfirm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-btn border border-danger/30 px-4 py-3 text-[14px] text-danger cursor-pointer hover:bg-danger/10 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          Reset tracking data
        </button>

        {/* Sign out */}
        <button type="button" onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 rounded-btn border border-border px-4 py-3 text-[14px] text-muted cursor-pointer hover:bg-card-hover transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Sign out
        </button>

        <p className="pt-4 text-center text-[11px] text-subtle">Made with love by Robel, for Atnasya</p>
      </div>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm rounded-card bg-card shadow-card p-6 space-y-4">
            <h3 className="text-[18px] font-bold text-text">Reset all tracking data?</h3>
            <p className="text-[14px] text-muted leading-relaxed">This will permanently delete all your cycles, symptoms, and vitals. You'll be taken through onboarding again.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowResetConfirm(false)} className="flex-1 rounded-btn border border-border px-4 py-3 text-[14px] font-semibold text-text cursor-pointer hover:bg-card-hover">Cancel</button>
              <button type="button" onClick={handleReset} disabled={resetting} className="flex-1 rounded-btn bg-danger px-4 py-3 text-[14px] font-semibold text-white cursor-pointer hover:opacity-90 disabled:opacity-50">
                {resetting ? "Resetting…" : "Reset"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-white shadow-card animate-fade-up">
          {toast}
        </div>
      )}
    </div>
  );
}
