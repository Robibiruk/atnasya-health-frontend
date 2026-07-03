// PWAInstallBanner — full-screen install popup that appears immediately on load.
// On Chrome: triggers the native beforeinstallprompt flow.
// On iOS/other: shows a brief Add-to-Home-Screen hint inline.
// Remembers dismissal in localStorage so it only shows once.
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function isIOS(): boolean {
  const ua = navigator.userAgent.toLowerCase();
  const isSafari = /safari/.test(ua) && !/chrome|chromium|crios/.test(ua);
  return /iphone|ipad|ipod/.test(ua) || (isSafari && navigator.maxTouchPoints > 0);
}

const STORAGE_KEY = "atnasya-pwa-dismissed";

export function PWAInstallBanner() {
  const [show, setShow] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installDone, setInstallDone] = useState(false);
  const [showTip, setShowTip] = useState(false);

  // Show popup after a short delay on first visit
  useEffect(() => {
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if (localStorage.getItem(STORAGE_KEY)) return;
    const timer = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Capture beforeinstallprompt for Chrome PWA install
  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Chrome native install
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        setInstallDone(true);
        localStorage.setItem(STORAGE_KEY, "true");
        setTimeout(() => { setShow(false); setInstallDone(false); }, 1500);
      }
      setDeferredPrompt(null);
    } else {
      // No native prompt — toggle the inline tip
      setShowTip(true);
    }
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, "true");
  };

  const handleLater = () => {
    setShow(false);
  };

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
          >
            {/* Close handle */}
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" />

            {installDone ? (
              /* Post-install confirmation */
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/20 text-[32px]">✓</div>
                <p className="text-[16px] font-bold text-text">Installing…</p>
              </div>
            ) : (
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

                {/* Inline tip for non-Chrome browsers */}
                {showTip && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-4 overflow-hidden"
                  >
                    <div className="rounded-lg bg-primary/10 p-3 border border-accent/20">
                      <p className="text-[12px] text-text font-medium mb-1">
                        {isIOS()
                          ? "📱 Tap Share → Add to Home Screen in Safari"
                          : "🌐 Open in Chrome or Edge, then use the browser's Install option"}
                      </p>
                      <p className="text-[11px] text-muted">
                        {isIOS()
                          ? "Your browser doesn't support auto-install. Use Safari's Share button to add Atnasya to your home screen."
                          : "Your browser doesn't support auto-install. Use the browser menu to install the app."}
                      </p>
                    </div>
                    {/* Back button — returns to main popup without dismissing */}
                    <button
                      type="button"
                      onClick={() => setShowTip(false)}
                      className="mt-2 w-full text-center text-[12px] text-primary font-medium cursor-pointer hover:opacity-80"
                    >
                      ← Back
                    </button>
                  </motion.div>
                )}

                {/* Buttons — hide CTA when tip is visible to avoid confusion */}
                {!showTip && (
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleInstall}
                      className="flex-1 rounded-btn bg-primary px-4 py-3 text-[13px] font-semibold text-white cursor-pointer hover:opacity-90 transition-opacity active:scale-[0.97]"
                    >
                      {deferredPrompt ? "Download App" : "How to Install"}
                    </button>
                    <button
                      type="button"
                      onClick={handleLater}
                      className="flex-1 rounded-btn border border-border px-4 py-3 text-[13px] font-semibold text-muted cursor-pointer hover:bg-card-hover transition-colors active:scale-[0.97]"
                    >
                      Stay on Web
                    </button>
                  </div>
                )}

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
