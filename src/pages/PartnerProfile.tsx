// PartnerProfile — the partner's Profile tab. 3 sections.
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { usePartner } from "../hooks/usePartner";
import { Spinner } from "../components/ui/Spinner";
import { api } from "../lib/api";
import { auth } from "../lib/firebase";

export function PartnerProfile() {
  const user = useAuthStore((s) => s.user);
  const role = useAuthStore((s) => s.role);
  const { connection, fetchConnection, updateSettings, revoke } = usePartner();
  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [showDisconnect, setShowDisconnect] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchConnection().finally(() => setLoading(false));
    setNameValue(user?.displayName ?? "");
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  if (role === "tracker") return <Navigate to="/profile" replace />;
  if (!user) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Spinner />
      </div>
    );
  }

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 1500);
  };

  const handleSaveName = async () => {
    if (!nameValue.trim()) return;
    try {
      await api.put("/auth/settings", { name: nameValue.trim() });
      setEditingName(false);
      showToast("Saved");
    } catch {
      showToast("Could not save");
    }
  };

  const handleDisconnect = async () => {
    await revoke();
    setShowDisconnect(false);
    showToast("Disconnected");
  };

  return (
    <div className="pb-24">
      <div className="px-5 pt-5">
        <h1 className="text-[20px] font-bold text-text mb-6">Profile</h1>
      </div>

      <div className="space-y-5 px-5">
        {/* SECTION 1 — Account info */}
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-white text-[18px] font-bold">
            {(editingName ? nameValue : user?.displayName ?? "?").charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            {editingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => setNameValue(e.target.value)}
                  className="flex-1 border-b-[1.5px] border-primary bg-transparent text-[16px] font-semibold text-text outline-none pb-1"
                />
                <button type="button" onClick={handleSaveName} aria-label="Save name" className="flex h-8 w-8 items-center justify-center rounded-full text-primary">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>
                </button>
                <button type="button" onClick={() => { setEditingName(false); setNameValue(user?.displayName ?? ""); }} aria-label="Cancel" className="flex h-8 w-8 items-center justify-center rounded-full text-muted">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-[18px] font-bold text-text truncate">{user?.displayName ?? "Partner"}</p>
                <button type="button" onClick={() => setEditingName(true)} aria-label="Edit name" className="flex h-6 w-6 items-center justify-center text-muted">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                </button>
              </div>
            )}
            <p className="text-[13px] text-muted">{user?.email}</p>
          </div>
        </div>

        {/* SECTION 2 — Connection card */}
        <div className="rounded-card bg-card shadow-card p-5 space-y-4">
          <p className="text-[13px] font-semibold uppercase tracking-wide text-muted">Partner connection</p>

          {connection?.status === "active" ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-white text-[14px] font-bold">
                  {connection.partnerName?.charAt(0)?.toUpperCase() ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-semibold text-text truncate">{connection.partnerName ?? "Partner"}</p>
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Connected
                  </span>
                </div>
              </div>

              {!showDisconnect ? (
                <button
                  type="button"
                  onClick={() => setShowDisconnect(true)}
                  className="text-[13px] text-danger font-medium cursor-pointer hover:underline"
                >
                  Disconnect
                </button>
              ) : (
                <div className="rounded-btn border border-danger/30 p-4 space-y-3">
                  <p className="text-[13px] text-text">
                    Disconnect from {connection.partnerName ?? "partner"}? You&apos;ll lose access to her cycle info.
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setShowDisconnect(false)}
                      className="flex-1 rounded-btn border border-border px-4 py-2.5 text-[13px] font-semibold text-text cursor-pointer hover:bg-card-hover"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDisconnect}
                      className="flex-1 rounded-btn bg-danger px-4 py-2.5 text-[13px] font-semibold text-white cursor-pointer hover:opacity-90"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <p className="text-[14px] text-muted">You&apos;re not connected to a partner yet</p>
          )}
        </div>

        {/* SECTION 3 — App settings */}
        <div className="rounded-card bg-card shadow-card overflow-hidden">
          <div className="flex items-center justify-between h-[52px] px-4">
            <div>
              <span className="text-[15px] text-text">Period reminders</span>
            </div>
            <button type="button" aria-label="Toggle period reminders" className="toggle-track active">
              <div className="toggle-thumb" />
            </button>
          </div>
          <div className="h-px bg-border mx-4" />
          <div className="flex items-center justify-between h-[52px] px-4">
            <div>
              <span className="text-[15px] text-text">Daily tip notification</span>
            </div>
            <button type="button" aria-label="Toggle daily tip" className="toggle-track active">
              <div className="toggle-thumb" />
            </button>
          </div>
          <div className="h-px bg-border mx-4" />
          <div className="flex items-center justify-between h-[52px] px-4">
            <span className="text-[15px] text-text">Dark mode</span>
            <button type="button" aria-label="Toggle dark mode" className="toggle-track">
              <div className="toggle-thumb" />
            </button>
          </div>
        </div>

        {/* Sign out */}
        <button
          type="button"
          onClick={() => auth.signOut().then(() => window.location.href = "/login")}
          className="flex w-full items-center justify-center gap-2 rounded-btn border border-border px-4 py-3 text-[14px] text-muted cursor-pointer hover:bg-card-hover transition-colors duration-150"
        >
          Sign out
        </button>

        {/* Reset all data */}
        <button
          type="button"
          onClick={() => {
            if (confirm("Reset all your data? This will disconnect from your partner and clear everything.")) {
              api.delete("/cycles").catch(() => {});
              revoke().then(() => window.location.href = "/onboarding");
            }
          }}
          className="w-full text-center text-[12px] text-danger font-medium cursor-pointer hover:underline pt-2"
        >
          Reset all data
        </button>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-28 left-1/2 -translate-x-1/2 z-50 rounded-full bg-success px-5 py-2.5 text-[13px] font-semibold text-white shadow-card animate-fade-up">
          {toast}
        </div>
      )}
    </div>
  );
}
