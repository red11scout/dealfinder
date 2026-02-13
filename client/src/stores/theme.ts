import { create } from "zustand";

type ThemeMode = "light" | "dark" | "system";
type EffectiveTheme = "light" | "dark";

interface ThemeState {
  theme: ThemeMode;
  effectiveTheme: EffectiveTheme;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

function getSystemTheme(): EffectiveTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolveTheme(theme: ThemeMode): EffectiveTheme {
  if (theme === "system") return getSystemTheme();
  return theme;
}

function applyThemeToDOM(effective: EffectiveTheme) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (effective === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

function loadPersistedTheme(): ThemeMode {
  if (typeof localStorage === "undefined") return "light";
  const stored = localStorage.getItem("blueally-theme");
  if (stored === "light" || stored === "dark" || stored === "system") {
    return stored;
  }
  return "light";
}

function persistTheme(theme: ThemeMode) {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem("blueally-theme", theme);
}

const initialTheme = loadPersistedTheme();
const initialEffective = resolveTheme(initialTheme);
applyThemeToDOM(initialEffective);

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: initialTheme,
  effectiveTheme: initialEffective,

  setTheme: (theme: ThemeMode) => {
    const effectiveTheme = resolveTheme(theme);
    persistTheme(theme);
    applyThemeToDOM(effectiveTheme);
    set({ theme, effectiveTheme });
  },

  toggleTheme: () => {
    const current = get().effectiveTheme;
    const next: ThemeMode = current === "light" ? "dark" : "light";
    const effectiveTheme = resolveTheme(next);
    persistTheme(next);
    applyThemeToDOM(effectiveTheme);
    set({ theme: next, effectiveTheme });
  },
}));

// Subscribe to system preference changes
if (typeof window !== "undefined") {
  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  mediaQuery.addEventListener("change", () => {
    const state = useThemeStore.getState();
    if (state.theme === "system") {
      const effectiveTheme = getSystemTheme();
      applyThemeToDOM(effectiveTheme);
      useThemeStore.setState({ effectiveTheme });
    }
  });
}
