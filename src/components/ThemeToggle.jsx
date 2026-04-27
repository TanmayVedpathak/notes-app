import { useTheme } from "../context/ThemeContext";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="flex items-center gap-2 rounded-lg border px-3 py-1.5
                 text-sm font-medium transition
                 text-black dark:text-white
                 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
      aria-label="Toggle theme"
    >
      {theme === "light" ? "🌙 Dark" : "☀️ Light"}
    </button>
  );
}
