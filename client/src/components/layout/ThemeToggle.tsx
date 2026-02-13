import { HiSun, HiMoon } from "react-icons/hi";
import { useThemeStore } from "../../stores/theme";

export function ThemeToggle() {
  const { effectiveTheme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      aria-label={
        effectiveTheme === "light"
          ? "Switch to dark mode"
          : "Switch to light mode"
      }
      className="relative flex items-center justify-center w-10 h-10 rounded-lg
        text-[var(--color-muted)] hover:text-[var(--color-foreground)]
        hover:bg-[var(--color-subtle)] transition-all duration-200
        focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-blue)]"
    >
      <span
        className={`absolute transition-all duration-300 ${
          effectiveTheme === "light"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 rotate-90 scale-75"
        }`}
      >
        <HiSun className="w-5 h-5" />
      </span>
      <span
        className={`absolute transition-all duration-300 ${
          effectiveTheme === "dark"
            ? "opacity-100 rotate-0 scale-100"
            : "opacity-0 -rotate-90 scale-75"
        }`}
      >
        <HiMoon className="w-5 h-5" />
      </span>
    </button>
  );
}
