// PWAInstallBanner — full-screen install popup that appears immediately on load.
// On Chrome: triggers the beforeinstallprompt flow.
// On iOS/Safari: shows Add-to-Home-Screen instructions.
// Remembers dismissal in localStorage so it only shows once.
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Platform = "ios" | "chrome" | "other";

function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  const isSafari = /safari/.test(ua) && !/chrome|chromium|crios/.test(ua);
  const isChrome = /chrome|chromium|crios/.test(ua);
  if (/iphone|ipad|ipod/.test(ua) || (isSafari && navigator.maxTouchPoints > 0)) return "ios";
  if (isChrome) return "chrome";
  return "other";
}

const STORAGE_KEY = "atnasya-pwa-dismissed";

export function PWAInstallBanner() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installOutcome, setInstallOutcome] = useState<"prompt" | "done" | null>(null);
  const [showIOSHelp, setShowIOSHelp] = useState(false);

  // --- Show the popup immediately; also capture the beforeinstallprompt event ---
  useEffect(() => {
    // Already installed as PWA → never show
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    // User dismissed it before
    if (localStorage.getItem(STORAGE_KEY)) return;

    // Show the popup after a short delay so the page renders first
    const timer = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Capture the beforeinstallprompt (Chrome) for later use
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    const platform = detectPlatform();

    if (platform === "chrome" && deferredPrompt) {
      // Chrome PWA install flow
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        setInstallOutcome("done");
        localStorage.setItem(STORAGE_KEY, "true");
        setTimeout(() => { setShow(false); setInstallOutcome(null); }, 2000);
      } else {
        setInstallOutcome("prompt");
      }
      setDeferredPrompt(null);
    } else {
      // iOS or other — show help text
      setShowIOSHelp(true);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    setShowIOSHelp(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const handleLater = () => {
    setShow(false);
    setShowIOSHelp(false);
  };

  const platform = detectPlatform();

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) handleLater(); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="w-full max-w-sm rounded-t-2xl bg-card p-6 shadow-[0_-8px_40px_rgba(0,0,0,0.3)] border-t border-accent/20"
            style={{ maxHeight: "85vh", overflowY: "auto" }}
          >
            {/* Close handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />

            {installOutcome === "done" ? (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-[32px]">✓</div>
                <p className="text-[16px] font-bold text-text">Installing…</p>
              </div>
            ) : showIOSHelp ? (
              /* iOS instructions */
              <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-white text-[20px] font-bold">
                    A
                  </div>
                  <div>
                    <p className="text-[16px] font-bold text-text">Install Atnasya</p>
                    <p className="text-[12px] text-muted">Step-by-step for your device</p>
                  </div>
                </div>

                <div className="space-y-4 mb-5">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[12px] font-bold text-primary">1</div>
                    <div>
                      <p className="text-[14px] font-semibold text-text">Open in Safari</p>
                      <p className="text-[12px] text-muted">Tap the Share button at the bottom of your screen.</p>
                    </div>
                  </div>
                  {/* Step 2 */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[12px] font-bold text-primary">2</div>
                    <div>
                      <p className="text-[14px] font-semibold text-text">Scroll down</p>
                      <p className="text-[12px] text-muted">Look for <strong>"Add to Home Screen"</strong> in the share menu.</p>
                    </div>
                  </div>
                  {/* Step 3 */}
                  <div className="flex items-start gap-3">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/20 text-[12px] font-bold text-primary">3</div>
                    <div>
                      <p className="text-[14px] font-semibold text-text">Tap Add</p>
                      <p className="text-[12px] text-muted">Confirm in the top right and Atnasya will appear on your home screen.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="flex-1 rounded-btn bg-primary px-4 py-2.5 text-[13px] font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    Done, thanks!
                  </button>
                  <button
                    type="button"
                    onClick={handleLater}
                    className="flex-1 rounded-btn border border-border px-4 py-2.5 text-[13px] font-semibold text-muted cursor-pointer hover:bg-card-hover transition-colors"
                  >
                    Later
                  </button>
                </div>
              </>
            ) : (
              /* Main install popup */
              <>
                {/* App icon + title */}
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-[#7B4F9E] to-[#C77DFF] text-white text-[22px] font-bold shadow-lg">
                    A
                  </div>
                  <div>
                    <p className="text-[17px] font-bold text-text">Download Atnasya App</p>
                    <p className="text-[12px] text-muted">Faster access, offline support, & more</p>
                  </div>
                </div>

                {/* Benefit bullets */}
                <div className="space-y-2.5 my-5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-[14px]">🚀</span>
                    <span className="text-[13px] text-text">One-tap from your home screen</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[14px]">📴</span>
                    <span className="text-[13px] text-text">Works offline — no internet needed</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[14px]">🔒</span>
                    <span className="text-[13px] text-text">Your data stays private on your device</span>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleInstall}
                    className="flex-1 rounded-btn bg-primary px-4 py-3 text-[13px] font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity active:scale-[0.97]"
                  >
                    {platform === "chrome" && deferredPrompt
                      ? "Download App"
                      : platform === "ios"
                        ? "Show Instructions"
                        : "Add to Home Screen"}
                  </button>
                  <button
                    type="button"
                    onClick={handleLater}
                    className="flex-1 rounded-btn border border-border px-4 py-3 text-[13px] font-semibold text-muted cursor-pointer hover:bg-card-hover transition-colors active:scale-[0.97]"
                  >
                    Stay on Web
                  </button>
                </div>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="mt-3 w-full text-center text-[11px] text-subtle cursor-pointer hover:text-muted transition-colors"
                >
                  Don't show again
                </button>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
