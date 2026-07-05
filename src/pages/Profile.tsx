// Profile — avatar, stats grid, partner connect, settings, preferences, privacy, export, FAQ, feedback.
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { TopBar } from "../components/layout/TopBar";
import { Card } from "../components/ui/Card";
import { useAuthStore } from "../store/authStore";
import { useCycleStore } from "../store/cycleStore";
import { useOnboarding } from "../hooks/useOnboarding";
import { auth } from "../lib/firebase";
import { api } from "../lib/api";
import { registerBackend } from "../lib/auth";
import { useState, useEffect, useRef } from "react";
import { QuickStats } from "../components/cycle/QuickStats";
import { usePartner } from "../hooks/usePartner";
import { InviteCodeDisplay } from "../components/partner/InviteCodeDisplay";
import { ThemePalettePicker } from "../components/ui/ThemePalettePicker";
import { PetSelector } from "../components/ui/PetIconDisplay";
import { FaviconPicker } from "../components/ui/FaviconPicker";
import { PetPickerModal } from "../components/ui/PetPickerModal";
import type { PetIcon, TrackingMode, AppLanguage, FAQItem } from "../types";

// Make pet avatar in Profile use the shared modal and close automatically after selection.
function PetAvatar() {
  const pet = useAuthStore((s) => s.pet);
  const setPet = useAuthStore((s) => s.setPet);
  const [open, setOpen] = useState(false);
  const prefix = pet.replace(/[0-9]/g, "");
  const folder = prefix === "cat" ? "cat" : prefix === "puppy" ? "puppy" : "animals";
  const petNum = pet.replace(/\D/g, "");
  const imgSrc = pet === "none" ? "" : `/pets/${folder}/${petNum}.png`;
  const fallbackEmoji = pet === "none" ? "+" : pet.startsWith("cat") ? "🐱" : pet.startsWith("puppy") ? "🐶" : "🐾";
  const petLabel = pet === "none" ? "Add pet" : prefix;

  const pick = (value: PetIcon) => {
    setPet(value);
    setOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-primary-light text-white text-[22px] font-bold flex-shrink-0 overflow-hidden cursor-pointer"
        title={petLabel}
      >
        {pet === "none" ? (
          <span className="text-[26px] opacity-90">{fallbackEmoji}</span>
        ) : (
          <img
            src={imgSrc}
            alt="pet"
            className="h-full w-full object-contain"
            onError={(e) => {
              const el = e.currentTarget;
              el.style.display = "none";
              if (!el.nextElementSibling) {
                const s = document.createElement("span");
                s.textContent = fallbackEmoji;
                s.className = "text-[26px] text-white font-bold";
                el.parentNode?.insertBefore(s, el.nextSibling);
              }
            }}
          />
        )}
      </button>
      <PetPickerModal
        open={open}
        onClose={() => setOpen(false)}
        current={pet as PetIcon}
        onChange={pick}
      />
    </>
  );
}

// Reuse existing PetSelector for below-avatar “change” row.

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
  const [showSyncSheet, setShowSyncSheet] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [showEmailSheet, setShowEmailSheet] = useState(false);
  const [isEmailSignUp, setIsEmailSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const { t, i18n } = useTranslation();
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
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [editingBirthYear, setEditingBirthYear] = useState(false);
  const [birthYearValue, setBirthYearValue] = useState<number | "">("");
  const setProfile = useAuthStore((s) => s.setProfile);

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

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetTracking();
      navigate("/onboarding", { replace: true });
    } catch {
      showToast("Could not reset data");
      setResetting(false);
    }
  };

  const handleUpgradeAccount = () => {
    setShowSyncSheet(true);
  };

  const handleSyncGoogle = async () => {
    setSyncLoading(true);
    setSyncError(null);
    try {
      const { GoogleAuthProvider, signInWithPopup, linkWithPopup } = await import("firebase/auth");
      const provider = new GoogleAuthProvider();
      const current = auth.currentUser;
      const result = await signInWithPopup(auth, provider);
      const fbUser = result.user;
      if (current?.isAnonymous) {
        const cred = GoogleAuthProvider.credentialFromResult(result);
        if (cred) await linkWithPopup(current, provider);
        await registerBackend(current);
        useAuthStore.getState().setUser(current);
      } else {
        await registerBackend(fbUser);
        useAuthStore.getState().setUser(fbUser);
      }
      setShowSyncSheet(false);
      setShowEmailSheet(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setSyncError(msg.includes("popup-closed-by-user") ? "Sign-in popup closed" : "Could not sign in with Google");
    } finally {
      setSyncLoading(false);
    }
  };

  const handleEmail = async () => {
    if (!email.trim() || !password) {
      setEmailError("Please enter both email and password");
      return;
    }
    if (isEmailSignUp && !fullName.trim()) {
      setEmailError("Please add your name");
      return;
    }
    if (isEmailSignUp && password !== confirmPassword) {
      setEmailError("Passwords do not match");
      return;
    }
    setSyncLoading(true);
    setEmailError(null);
    try {
      const current = auth.currentUser;
      let fbUser;
      if (current?.isAnonymous) {
        const credential = (await import("firebase/auth")).EmailAuthProvider.credential(email.trim(), password);
        await (await import("firebase/auth")).linkWithCredential(current, credential);
        fbUser = current;
      } else {
        const { signInWithEmailAndPassword, createUserWithEmailAndPassword } = await import("firebase/auth");
        fbUser = isEmailSignUp
          ? (await createUserWithEmailAndPassword(auth, email.trim(), password)).user
          : (await signInWithEmailAndPassword(auth, email.trim(), password)).user;
      }
      await registerBackend(fbUser);
      if (isEmailSignUp && fullName.trim()) {
        try {
          await api.put("/auth/profile", { name: fullName.trim(), email: email.trim() });
        } catch {
          // non-blocking
        }
      }
      useAuthStore.getState().setUser(fbUser);
      setShowEmailSheet(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setEmailError(isEmailSignUp ? "Could not create account" : `${msg}`);
    } finally {
      setSyncLoading(false);
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

  const [wishlistItems, setWishlistItems] = useState<string[]>([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [wishlistInput, setWishlistInput] = useState("");

  useEffect(() => {
    if (connection?.status !== "active") return;
    let cancelled = false;
    setWishlistLoading(true);
    api.get("/partner/wishlist")
      .then((res) => {
        if (!cancelled && res.data?.success) setWishlistItems(res.data.data.items ?? []);
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setWishlistLoading(false); });
    return () => { cancelled = true; };
  }, [connection?.status, connection?.inviteCode]);

  const addWishlistItem = async () => {
    const text = wishlistInput.trim();
    if (!text) return;
    setWishlistLoading(true);
    try {
      const res = await api.post("/partner/wishlist", { item: text });
      if (res.data?.success) setWishlistItems(res.data.data.items ?? []);
      setWishlistInput("");
    } catch {
      showToast("Could not add wishlist item");
    } finally {
      setWishlistLoading(false);
    }
  };

  const removeWishlistItem = async (index: number) => {
    setWishlistLoading(true);
    try {
      const res = await api.delete(`/partner/wishlist/${index}`);
      if (res.data?.success) setWishlistItems(res.data.data.items ?? []);
    } catch {
      showToast("Could not remove item");
    } finally {
      setWishlistLoading(false);
    }
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

  const feedbackFormRef = useRef<HTMLFormElement>(null);

  const handleSubmitFeedback = async () => {
   if (!feedbackText.trim()) return;
   setSubmittingFeedback(true);
   try {
    const u = useAuthStore.getState().user;
    const name = profile?.name || u?.displayName || "Anonymous";
    const email = u?.email || "";

    if (import.meta.env.DEV) {
     showToast("Thanks! Feedback will send when deployed.");
    } else {
     const form = feedbackFormRef.current;
     const nameInput = form?.querySelector('[name="name"]') as HTMLInputElement | null;
     const emailInput = form?.querySelector('[name="email"]') as HTMLInputElement | null;
     const msgInput = form?.querySelector('[name="message"]') as HTMLTextAreaElement | null;

     if (nameInput) nameInput.value = name;
     if (emailInput) emailInput.value = email;
     if (msgInput) msgInput.value = feedbackText;

     if (form) {
       form.submit();
       return;
     }
     showToast("Thanks for your feedback! ❤️");
    }
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
          <PetAvatar />
          <div className="min-w-0 flex-1">
            {editingName ? (
              <div className="space-y-2">
                <input
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  placeholder="Your name"
                  className="w-full rounded-btn border border-border bg-card px-3 py-2 text-[15px] text-text outline-none focus:border-primary"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={savingName}
                    onClick={async () => {
                      if (!nameValue.trim()) return;
                      setSavingName(true);
                      await updateSetting("name", nameValue.trim());
                      setProfile({ ...(profile as any), name: nameValue.trim() });
                      setEditingName(false);
                      setSavingName(false);
                    }}
                    className="rounded-btn bg-primary px-3 py-2 text-[12px] font-semibold text-white cursor-pointer disabled:opacity-50"
                  >
                    {savingName ? "Saving..." : "Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditingName(false); setNameValue(displayName); }}
                    className="rounded-btn border border-border px-3 py-2 text-[12px] font-semibold text-text cursor-pointer hover:bg-card-hover"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-[20px] font-bold text-text truncate">{displayName}</h2>
                  <p className="text-[13px] text-muted">
                    {onboardingCompleted ? `${t("profile.tracking.mode")}: ${t("profile.tracking." + trackingMode)}` : t("profile.onboarding.prompt")}
                  </p>
                  {profile?.birthYear && editingBirthYear ? (
                    <div className="mt-2 flex items-center gap-2">
                      <select
                        value={birthYearValue === "" ? profile?.birthYear ?? new Date().getFullYear() - 25 : birthYearValue}
                        onChange={(e) => setBirthYearValue(Number(e.target.value))}
                        className="rounded-btn border border-border bg-card px-2 py-1 text-[12px] text-text outline-none focus:border-primary"
                      >
                        {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 12 - i).map((y) => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={async () => {
                          await updateSetting("birthYear", birthYearValue === "" ? null : Number(birthYearValue));
                          setEditingBirthYear(false);
                        }}
                        className="text-[12px] text-primary font-semibold cursor-pointer"
                      >Save</button>
                      <button
                        type="button"
                        onClick={() => setEditingBirthYear(false)}
                        className="text-[12px] text-muted cursor-pointer"
                      >Cancel</button>
                    </div>
                  ) : profile?.birthYear ? (
                    <button
                      type="button"
                      onClick={() => { setEditingBirthYear(true); setBirthYearValue(profile?.birthYear ?? ""); }}
                      className="text-[12px] text-muted cursor-pointer underline"
                    >Born {profile.birthYear}</button>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => { setEditingName(true); setNameValue(displayName || ""); }}
                  className="text-[12px] text-primary font-semibold cursor-pointer flex-shrink-0"
                >
                  Edit
                </button>
              </div>
            )}
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
                <p className="text-[14px] font-semibold text-text">{t("profile.tracking.mode")}</p>
                <p className="text-[12px] text-muted">{t("profile.tracking." + trackingMode)}</p>
              </div>
            </div>
            <button type="button" onClick={() => setShowTrackingModePicker(!showTrackingModePicker)} className="text-[12px] text-primary cursor-pointer font-semibold">
              {t("profile.change")}
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

        {/* Partner section */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06 1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            <h3 className="text-[16px] font-bold text-text">{t("partner.title")}</h3>
          </div>

          {(!user || user.isAnonymous) && (
            <div className="rounded-card border border-border bg-card p-5 space-y-3">
              <p className="text-[13px] text-text font-semibold">Sign in to use Partner Connect</p>
              <p className="text-[12px] text-muted leading-relaxed">Local partner data is hidden for anonymous users. Sign in to sync partner info and connect with your partner.</p>
              <button type="button" onClick={handleUpgradeAccount} className="w-full rounded-btn bg-primary px-5 py-3 text-[15px] font-semibold text-white cursor-pointer hover:opacity-90">Sign in to sync</button>
            </div>
          )}
          {(user && !user.isAnonymous) && (!connection || connection.status === "none") && (
            <div className="rounded-card bg-card shadow-card p-5 space-y-4">
              <div className="flex justify-center">
                <div className="relative flex items-center">
                  <div className="h-12 w-12 rounded-full bg-primary-light" />
                  <div className="h-12 w-12 rounded-full border-2 border-[var(--color-accent)] -ml-3 bg-card" />
                </div>
              </div>
              <div className="text-center space-y-2">
                <h4 className="text-[16px] font-bold text-text">{t("partner.connect.title")}</h4>
                <p className="text-[13px] text-muted max-w-[240px] mx-auto">{t("partner.connect.desc")}</p>
              </div>
              <button type="button" onClick={handleCreateInvite} disabled={partnerLoading}
                className="w-full rounded-btn bg-primary px-5 py-3 text-[15px] font-semibold text-white cursor-pointer transition-opacity hover:opacity-90 disabled:opacity-50">
                {partnerLoading ? t("creating") : t("partner.invite.send")}
              </button>
              <div className="border-t border-border pt-4 space-y-3">
                <p className="text-[15px] font-semibold text-text">{t("partner.invite.have")}</p>
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
                  {partnerLoading ? t("connecting") : t("partner.connect.action")}
                </button>
              </div>
            </div>
          )}

          {(user && !user.isAnonymous) && connection?.status === "pending" && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-card p-5 space-y-4"
              style={{ background: "var(--color-card)", boxShadow: "var(--shadow-card)", border: "2px solid transparent", backgroundImage: "linear-gradient(var(--color-card), var(--color-card)), linear-gradient(135deg, var(--color-primary), var(--color-accent))", backgroundOrigin: "border-box", backgroundClip: "padding-box, border-box" }}
            >
              <div className="flex justify-center">
                <span className="inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold" style={{ backgroundColor: "rgba(245,158,11,0.15)", color: "#F59E0B" }}>{t("partner.waiting")}</span>
              </div>
              <InviteCodeDisplay code={connection.inviteCode ?? ""} />
              <div className="flex gap-2">
                <button type="button" onClick={handleCopyCode} className="flex-1 flex items-center justify-center gap-2 rounded-btn border border-border px-4 py-2.5 text-[13px] font-semibold text-text cursor-pointer hover:bg-card-hover">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                  {copied ? t("copied") : t("partner.copy")}
                </button>
                <button type="button" onClick={() => setShowPartnerConfirm(true)} className="w-full text-center text-[12px] text-danger font-medium cursor-pointer hover:underline">{t("partner.revoke")}</button>
              </div>
              {showPartnerConfirm && (
                <div className="rounded-btn border border-danger/30 p-4 space-y-3">
                  <p className="text-[13px] text-text">{t("partner.revoke.confirm")}</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowPartnerConfirm(false)} className="flex-1 rounded-btn border border-border px-4 py-2.5 text-[13px] font-semibold text-text cursor-pointer">{t("cancel")}</button>
                    <button type="button" onClick={handleRevoke} className="flex-1 rounded-btn bg-danger px-4 py-2.5 text-[13px] font-semibold text-white cursor-pointer">{t("delete")}</button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {(user && !user.isAnonymous) && connection?.status === "active" && (
            <div className="rounded-card bg-card shadow-card p-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-white text-[16px] font-bold">
                  {connection.partnerName?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-text">{connection.partnerName ?? t("partner.title")}</p>
                  <span className="text-[11px] font-medium text-success">{t("partner.connected")}</span>
                </div>
              </div>
              <div className="space-y-4">
                {/* Phase (always on) */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px]">🌸</span>
                    <span className="text-[14px] text-text">{t("partner.sharing.phase")}</span>
                  </div>
                  <span className="text-[11px] text-muted">{t("partner.always.on")}</span>
                </div>
                {/* Mood toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px]">😊</span>
                    <div><span className="text-[14px] text-text">{t("partner.sharing.mood")}</span><p className="text-[10px] text-muted">{t("partner.sharing.mood.desc")}</p></div>
                  </div>
                  <button type="button" onClick={handleToggleMood} aria-label={t("partner.sharing.mood")} className={`toggle-track ${connection.shareMood ? "active" : ""}`}><div className="toggle-thumb" /></button>
                </div>
                {/* Share symptoms toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px]">🌿</span>
                    <div><span className="text-[14px] text-text">{t("partner.sharing.symptoms")}</span><p className="text-[10px] text-muted">{t("partner.sharing.symptoms.desc")}</p></div>
                  </div>
                  <button type="button" onClick={handleToggleSymptoms} aria-label={t("partner.sharing.symptoms")} className={`toggle-track ${connection.shareSymptoms ? "active" : ""}`}><div className="toggle-thumb" /></button>
                </div>
                {/* Pregnancy sharing toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px]">🤰</span>
                    <div><span className="text-[14px] text-text">{t("partner.sharing.pregnancy")}</span><p className="text-[10px] text-muted">{t("partner.sharing.pregnancy.desc")}</p></div>
                  </div>
                  <button type="button" onClick={handleTogglePregnancy} aria-label={t("partner.sharing.pregnancy")} className={`toggle-track ${connection.sharePregnancy ? "active" : ""}`}><div className="toggle-thumb" /></button>
                </div>
                {/* Pause sharing */}
                <div className="border-t border-border pt-3">
                  <button type="button" onClick={() => {
                    if (confirm("Pause sharing? Your partner won't see any updates until you resume.")) {
                      showToast("Sharing paused");
                    }
                  }}
                    className="w-full rounded-btn border border-border px-4 py-2.5 text-[13px] font-semibold text-muted cursor-pointer hover:bg-card-hover transition-colors">
                    ⏸ {t("partner.sharing.pause")}
                  </button>
                </div>
                {/* Shared wishlist */}
                <div className="border-t border-border pt-3 space-y-2">
                  <p className="text-[13px] font-semibold text-text">🌸 {(t("Add Wishlist Item") || "Shared wishlist").toString()}</p>
                  <div className="space-y-2">
                    {wishlistLoading && <p className="text-[12px] text-muted">Loading...</p>}
                    {!wishlistLoading && wishlistItems.length === 0 && (
                      <p className="text-[12px] text-muted">No wishlist items yet.</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      {wishlistItems.map((item, idx) => (
                        <span key={idx} className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-3 py-1.5 text-[12px] font-medium text-text">
                          <span className="truncate max-w-[180px]">{item}</span>
                          <button type="button" onClick={() => removeWishlistItem(idx)} className="text-muted cursor-pointer hover:text-text">✕</button>
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={wishlistInput}
                        onChange={(e) => setWishlistInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addWishlistItem();
                        }}
                        placeholder="Add a wish..."
                        className="flex-1 rounded-btn border border-border bg-card px-3 py-2 text-[13px] text-text outline-none focus:border-primary"
                      />
                      <button type="button" onClick={addWishlistItem} disabled={wishlistLoading} className="rounded-btn bg-primary text-white px-4 py-2 text-[13px] font-semibold cursor-pointer hover:bg-primary-light disabled:opacity-50">
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setShowPartnerConfirm(true)} className="w-full text-center text-[12px] text-danger font-medium cursor-pointer hover:underline">
                {t("partner.remove")}
              </button>
              {showPartnerConfirm && (
                <div className="rounded-btn border border-danger/30 p-4 space-y-3">
                  <p className="text-[13px] text-text">{t("partner.remove.confirm")}</p>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => setShowPartnerConfirm(false)} className="flex-1 rounded-btn border border-border text-[13px] font-semibold">{t("cancel")}</button>
                    <button type="button" onClick={handleRevoke} className="flex-1 rounded-btn bg-danger text-white text-[13px] font-semibold">{t("disconnect")}</button>
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
            if (!("Notification" in window)) { showToast(t("notif.unsupported")); return; }
            setProfile({
              ...(profile as any),
              settings: {
                ...(profile?.settings ?? {}),
                notifications: !(profile?.settings?.notifications ?? false),
              },
            });

            if (Notification.permission === "granted") {
              const next = !(profile?.settings?.notifications ?? false);
              await updateSetting("notifications", next);
            } else if (Notification.permission === "denied") {
              showToast(t("notif.denied"));
            } else {
              const perm = await Notification.requestPermission();
              if (perm === "granted") {
                await updateSetting("notifications", true);
                showToast(t("notif.enabled"));
              } else {
                showToast(t("notif.disabled"));
              }
            }
          }}
            className="flex w-full items-center justify-between h-[52px] px-4 cursor-pointer hover:bg-card-hover">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></svg>
              <span className="text-[15px] text-text">{t("notifications")}</span>
            </div>
            <div className={`toggle-track ${profile?.settings?.notifications ? "active" : ""}`}><div className="toggle-thumb" /></div>
          </button>
          {/* Reminders */}
          <button type="button" onClick={() => showToast(t("reminder.coming.soon"))}
            className="flex w-full items-center justify-between h-[52px] px-4 border-t border-border cursor-pointer hover:bg-card-hover">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              <span className="text-[15px] text-text">{t("reminder.settings")}</span>
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
              <span className="text-[15px] text-text">{t("units")}</span>
            </div>
            <span className="text-[12px] text-muted">{profile?.settings?.unit ?? "metric"}</span>
          </button>
          {/* Language */}
          <button type="button" onClick={() => setShowLanguagePicker(!showLanguagePicker)}
            className="flex w-full items-center justify-between h-[52px] px-4 border-t border-border cursor-pointer hover:bg-card-hover">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
              <span className="text-[15px] text-text">{t("language")}</span>
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
              <span className="text-[15px] text-text">{t("dark.mode")}</span>
            </div>
            <button type="button" onClick={toggleTheme} aria-label={t("dark.mode")} className={`toggle-track ${theme === "dark" ? "active" : ""}`}><div className="toggle-thumb" /></button>
          </div>
          {/* Anonymous mode */}
          <div className="flex items-center justify-between h-[52px] px-4 border-t border-border">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
              <span className="text-[15px] text-text">{t("anonymous.mode")}</span>
            </div>
            <button type="button" onClick={toggleAnonymousMode} aria-label={t("anonymous.mode")} className={`toggle-track ${anonymousMode ? "active" : ""}`}><div className="toggle-thumb" /></button>
          </div>
          {/* Color palette */}
          <div className="px-4 py-3 border-t border-border">
            <ThemePalettePicker />
          </div>
          {/* Pet avatar */}
          <div className="px-4 py-3 border-t border-border">
            <PetSelector />
          </div>
          {/* App icon */}
          <div className="px-4 py-3 border-t border-border">
            <FaviconPicker />
          </div>
        </Card>

        {/* PRIVACY & SECURITY CARD */}
        <Card className="p-0 overflow-hidden">
          <div className="px-4 h-[44px] flex items-center border-b border-border">
            <span className="text-[14px] font-semibold text-text">{t("privacy.security")}</span>
          </div>
          {/* Data encryption */}
          <div className="flex items-center justify-between h-[52px] px-4 border-t border-border cursor-pointer hover:bg-card-hover" onClick={() => { setDataEncryption(!dataEncryption); updateSetting("dataEncryption", !dataEncryption); }}>
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <span className="text-[15px] text-text">{t("data.encryption")}</span>
            </div>
            <div className={`toggle-track ${dataEncryption ? "active" : ""}`}><div className="toggle-thumb" /></div>
          </div>
          {/* Delete account */}
          <button type="button" onClick={() => showToast(t("reminder.coming.soon"))}
            className="flex w-full items-center justify-between h-[52px] px-4 border-t border-border cursor-pointer hover:bg-card-hover">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-danger)" strokeWidth="2" className="text-muted"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              <span className="text-[15px] text-danger">{t("delete.account")}</span>
            </div>
          </button>
        </Card>

        {/* DATA & EXPORT */}
        <Card className="p-0 overflow-hidden">
          <button type="button" onClick={handleDataExport}
            className="flex w-full items-center justify-between h-[52px] px-4 cursor-pointer hover:bg-card-hover">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
              <span className="text-[15px] text-text">{t("data.export")}</span>
            </div>
          </button>
          <button type="button" onClick={() => showToast(t("export.coming.soon"))}
            className="flex w-full items-center justify-between h-[52px] px-4 border-t border-border cursor-pointer hover:bg-card-hover">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              <span className="text-[15px] text-text">{t("data.export.pdf")}</span>
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
              <span className="text-[15px] text-text">{t("help.faq")}</span>
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
              <span className="text-[15px] text-text">{t("send.feedback")}</span>
            </div>
          </button>
          {showFeedback && (
            <>
              <form ref={feedbackFormRef} action="/" method="POST" data-netlify="true" data-netlify-honeypot="bot-field" className="hidden">
                <input type="hidden" name="form-name" value="feedback" />
              </form>
              <form onSubmit={(e) => { e.preventDefault(); handleSubmitFeedback(); }} className="px-4 pb-4 space-y-3 border-t border-border pt-3">
               <input type="hidden" name="form-name" value="feedback" />
               <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} placeholder="Tell us what you think..." rows={3} className="w-full rounded-btn border border-border bg-card px-3 py-2.5 text-[13px] text-text outline-none focus:border-primary" />
               <button type="submit" disabled={!feedbackText.trim() || submittingFeedback} className="w-full rounded-btn bg-primary text-white py-2.5 text-[13px] font-semibold cursor-pointer disabled:opacity-50">
                {submittingFeedback ? t("sending") : t("submit")}
               </button>
              </form>
            </>
           )}

          {/* Rate app */}
          <button type="button" onClick={() => showToast(t("rate.prompt"))}
            className="flex w-full items-center justify-between h-[52px] px-4 border-t border-border cursor-pointer hover:bg-card-hover">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              <span className="text-[15px] text-text">{t("rate.app")}</span>
            </div>
          </button>

          {/* Secret chat */}
          <button type="button" onClick={() => navigate("/secret")}
            className="flex w-full items-center justify-between h-[52px] px-4 border-t border-border cursor-pointer hover:bg-card-hover">
            <div className="flex items-center gap-3">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-muted"><path d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
              <span className="text-[15px] text-text">{t("secret.chat")}</span>
            </div>
            <span className="text-[12px] text-muted">PIN 0000</span>
          </button>
        </Card>

        {/* Reset tracking data */}
        <button type="button" onClick={() => setShowResetConfirm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-btn border border-danger/30 px-4 py-3 text-[14px] text-danger cursor-pointer hover:bg-danger/10 transition-colors">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          {t("profile.reset")}
        </button>

        {/* Anonymous sync / sign-in */}

        {(!user || user.isAnonymous) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
            <Card className="p-4 space-y-2">
              <p className="text-[14px] font-semibold text-text">Sign in to sync data</p>
              <p className="text-[12px] text-muted leading-relaxed">Sign in to keep your data synced and access it on another device.</p>
              <div className="space-y-2">
                <button type="button" onClick={handleUpgradeAccount} className="w-full rounded-btn border border-border bg-card px-4 py-3 text-[14px] font-semibold text-text cursor-pointer hover:bg-card-hover transition-colors">Sign in / Create account</button>
              </div>
            </Card>
          </motion.div>
        )}

        {(user && !user.isAnonymous) && (
          <button type="button" onClick={async () => { try { await auth.signOut(); } finally { logout(); navigate("/login", { replace: true }); }}} className="flex w-full items-center justify-center gap-2 rounded-btn border border-border px-4 py-3 text-[14px] text-muted cursor-pointer hover:bg-card-hover transition-colors">Sign out</button>
        )}

        {/* Sync bottom sheet */}
        <AnimatePresence>
          {showSyncSheet && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm">
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 24, stiffness: 260 }} className="w-full rounded-t-[28px] bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-text">Sign in to sync</h3>
                  <button type="button" onClick={() => setShowSyncSheet(false)} className="text-[12px] text-muted font-semibold">Cancel</button>
                </div>
                <button type="button" disabled={syncLoading} onClick={handleSyncGoogle} className="flex w-full items-center justify-center gap-3 rounded-btn bg-card border border-border px-5 py-3.5 text-[15px] font-semibold text-text cursor-pointer hover:bg-card-hover disabled:opacity-50">
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>

                <div className="text-center text-[12px] text-muted">or</div>
                <button type="button" onClick={() => { setShowEmailSheet(true); }} disabled={syncLoading} className="w-full rounded-btn bg-primary text-white px-5 py-3.5 text-[15px] font-semibold cursor-pointer transition-colors hover:bg-primary-light disabled:opacity-50">
                  {syncLoading ? "Please wait..." : "Sign in with email"}
                </button>
                {syncError && <p className="text-center text-[13px] text-danger">{syncError}</p>}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Email auth bottom sheet */}
        <AnimatePresence>
          {showEmailSheet && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-end bg-black/40 backdrop-blur-sm">
              <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 24, stiffness: 260 }} className="w-full rounded-t-[28px] bg-card p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-[16px] font-bold text-text">{isEmailSignUp ? "Create account" : "Sign in"}</h3>
                  <button type="button" onClick={() => setShowEmailSheet(false)} className="text-[12px] text-muted font-semibold">Cancel</button>
                </div>
                <input
                  id="sheet-email"
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-btn border border-border bg-card px-4 py-3 text-[15px] text-text outline-none focus:border-primary"
                />
                <input
                  id="sheet-password"
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-btn border border-border bg-card px-4 py-3 text-[15px] text-text outline-none focus:border-primary"
                />
                {isEmailSignUp && (
                  <>
                    <input
                      id="sheet-name"
                      type="text"
                      placeholder="Full name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-btn border border-border bg-card px-4 py-3 text-[15px] text-text outline-none focus:border-primary"
                    />
                    <input
                      id="sheet-confirm"
                      type="password"
                      placeholder="Confirm password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full rounded-btn border border-border bg-card px-4 py-3 text-[15px] text-text outline-none focus:border-primary"
                    />
                  </>
                )}
                <button type="button" onClick={handleEmail} disabled={syncLoading} className="w-full rounded-btn bg-primary text-white px-5 py-3.5 text-[15px] font-semibold cursor-pointer transition-colors hover:bg-primary-light disabled:opacity-50">
                  {syncLoading ? "Please wait..." : isEmailSignUp ? "Create account" : "Sign in"}
                </button>
                <button type="button" onClick={() => { setIsEmailSignUp(!isEmailSignUp); setEmailError(null); }} className="w-full text-center text-[13px] text-muted underline cursor-pointer">
                  {isEmailSignUp ? "Have an account? Sign in" : "New here? Create an account"}
                </button>
                {emailError && <p className="text-center text-[13px] text-danger">{emailError}</p>}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast */}
      </div>

      {/* Reset confirmation modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-6">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm rounded-card bg-card shadow-card p-6 space-y-4">
            <h3 className="text-[18px] font-bold text-text">{t("profile.reset.confirm")}</h3>
            <p className="text-[14px] text-muted leading-relaxed">This will permanently delete all your cycles, symptoms, and vitals. You'll be taken through onboarding again.</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setShowResetConfirm(false)} className="flex-1 rounded-btn border border-border px-4 py-3 text-[14px] font-semibold text-text cursor-pointer hover:bg-card-hover">{t("cancel")}</button>
              <button type="button" onClick={handleReset} disabled={resetting} className="flex-1 rounded-btn bg-danger px-4 py-3 text-[14px] font-semibold text-white cursor-pointer hover:opacity-90 disabled:opacity-50">
                {resetting ? t("resetting") : t("delete")}
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
