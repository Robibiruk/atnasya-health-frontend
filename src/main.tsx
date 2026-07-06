// Entry point — mounts the app and applies the persisted theme.
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import "./i18n";

// Suppress known harmless browser extension / Firebase service worker noise
// ("listener indicated an asynchronous response... message channel closed")
const _origError = console.error;
console.error = (...args: unknown[]) => {
  const msg = typeof args[0] === "string" ? args[0] : "";
  if (
    msg.includes("asynchronous response") ||
    msg.includes("message channel closed") ||
    msg.includes("Cross-Origin-Opener-Policy")
  ) {
    return; // swallow these noise messages
  }
  _origError.apply(console, args);
};

// Also suppress the uncaught promise version of the same noise
window.addEventListener("unhandledrejection", (event) => {
  const msg =
    (event.reason && (event.reason.message || String(event.reason))) || "";
  if (
    msg.includes("asynchronous response") ||
    msg.includes("message channel closed") ||
    msg.includes("Cross-Origin-Opener-Policy")
  ) {
    event.stopImmediatePropagation(); // silence it
  }
});

// Apply persisted theme before paint to avoid flash.

// Apply persisted theme before paint to avoid flash.
const stored = localStorage.getItem("atnasya-auth");
if (stored) {
  try {
    const parsed = JSON.parse(stored);
    const theme = parsed?.state?.theme;
    if (theme === "light" || theme === "dark") {
      document.documentElement.setAttribute("data-theme", theme);
    }
  } catch {
    // ignore
  }
} else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
  document.documentElement.setAttribute("data-theme", "dark");
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      await navigator.serviceWorker.register("/sw.js");
    } catch {
      // ignore registration issues; app still works
    }
  });
}
