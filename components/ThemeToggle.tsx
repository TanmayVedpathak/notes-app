"use client";

import { useTheme } from "@/context/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();
  return (
    <>
      <button type="button" onClick={toggleTheme} className="reader-button theme-toggle" aria-label="Toggle theme">
        {theme === "light" ? "🌙 Dark" : "☀️ Light"}
      </button>
    </>
  );
};

export default ThemeToggle;
