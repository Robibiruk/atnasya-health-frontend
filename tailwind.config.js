/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        "primary-light": "var(--color-primary-light)",
        accent: "var(--color-accent)",
        "accent-light": "var(--color-accent-light)",
        surface: "var(--color-bg)",
        card: "var(--color-card)",
        "card-hover": "var(--color-card-hover)",
        muted: "var(--color-muted)",
        subtle: "var(--color-subtle)",
        border: "var(--color-border)",
        period: "var(--color-period)",
        fertile: "var(--color-fertile)",
        ovulation: "var(--color-ovulation)",
        pms: "var(--color-pms)",
        follicular: "var(--color-follicular)",
        success: "var(--color-success)",
        warning: "var(--color-warning)",
        danger: "var(--color-danger)",
        text: "var(--color-text)",
      },
      borderRadius: {
        card: "var(--radius-card)",
        btn: "var(--radius-btn)",
      },
      boxShadow: {
        card: "var(--shadow-card)",
      },
      fontFamily: {
        sans: [
          "Plus Jakarta Sans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "sans-serif",
        ],
        serif: ["DM Serif Display", "Georgia", "serif"],
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        screenIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        screenOut: {
          "0%": { opacity: "1", transform: "translateY(0)" },
          "100%": { opacity: "0", transform: "translateY(-6px)" },
        },
        pulsering: {
          "0%": { boxShadow: "0 0 0 0 rgba(123,79,158,0.5)" },
          "70%": { boxShadow: "0 0 0 14px rgba(123,79,158,0)" },
          "100%": { boxShadow: "0 0 0 0 rgba(123,79,158,0)" },
        },
        dayPop: {
          "0%": { transform: "scale(0.5)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        tapBounce: {
          "0%": { transform: "scale(0.92)" },
          "100%": { transform: "scale(1)" },
        },
        sheetUp: {
          "0%": { transform: "translateY(100%)" },
          "100%": { transform: "translateY(0)" },
        },
        dayReveal: {
          "0%": { opacity: "0", transform: "scale(0.6) translateY(6px)" },
          "100%": { opacity: "1", transform: "scale(1) translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fadeUp 0.4s ease-out forwards",
        "screen-in": "screenIn 0.25s ease-out forwards",
        "screen-out": "screenOut 0.15s ease-out forwards",
        pulsering: "pulsering 2s ease-out infinite",
        "day-pop": "dayPop 0.3s ease-out forwards",
        "day-reveal": "dayReveal 200ms ease-out forwards",
        "tap-bounce": "tapBounce 80ms ease-out",
        "sheet-up": "sheetUp 380ms cubic-bezier(0.34,1.56,0.64,1) forwards",
      },
    },
  },
  plugins: [],
};
