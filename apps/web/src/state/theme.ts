import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ThemeMode = "light" | "dark";

const THEME_KEY = "esp.theme";

interface ThemeState {
  mode: ThemeMode;
  toggle: () => void;
  setMode: (mode: ThemeMode) => void;
}

function applyTheme(mode: ThemeMode) {
  const el = document.documentElement;
  el.classList.toggle("dark", mode === "dark");
  el.style.colorScheme = mode;
}

const initialState = (): ThemeMode => {
  try {
    const saved = window.localStorage.getItem(THEME_KEY);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    /* ignore */
  }
  return "light";
};

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      mode: initialState(),
      setMode: (mode) => {
        applyTheme(mode);
        set({ mode });
      },
      toggle: () => get().setMode(get().mode === "dark" ? "light" : "dark"),
    }),
    { name: THEME_KEY },
  ),
);

if (typeof document !== "undefined") {
  applyTheme(initialState());
}
