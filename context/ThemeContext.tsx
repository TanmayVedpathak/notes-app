"use client";

import { createContext, useContext, useSyncExternalStore } from "react";

import type { Theme } from "@/types";

type ThemeContextValue = {
  theme: Theme;
  toggleTheme: () => void;
};

type ThemeProviderProps = {
  children: React.ReactNode;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);
const themeChangeEvent = "themeChange";

const getThemeSnapshot = (): Theme => (document.documentElement.classList.contains("light") ? "light" : "dark");

const getServerThemeSnapshot = (): Theme => "dark";

const subscribeToTheme = (onThemeChange: () => void) => {
  window.addEventListener(themeChangeEvent, onThemeChange);
  return () => window.removeEventListener(themeChangeEvent, onThemeChange);
};

const applyTheme = (theme: Theme) => {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);

  try {
    localStorage.setItem("theme", theme);
  } catch {
    // The theme should still work when browser privacy settings block storage.
  }

  window.dispatchEvent(new Event(themeChangeEvent));
};

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, getServerThemeSnapshot);

  const toggleTheme = () => {
    applyTheme(theme === "light" ? "dark" : "light");
  };

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
};
