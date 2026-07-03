// ThemeToggle — sun/moon icon toggle. Flips theme + persists + sets data-theme.
import { Moon, Sun } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

export function ThemeToggle() {
  const theme = useAuthStore((s) => s.theme);
  const toggleTheme = useAuthStore((s) => s.toggleTheme);

  return (
    <button
      onClick={toggleTheme}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className="tap rounded-full border border-border bg-card p-2 text-muted transition-colors hover:bg-card-hover"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 text-primary" />
      ) : (
        <Moon className="h-5 w-5 text-primary" />
      )}
    </button>
  );
}
