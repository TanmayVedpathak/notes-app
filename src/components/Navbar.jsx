import { Link } from "react-router-dom";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <nav className="border-b bg-white dark:bg-gray-900 dark:border-gray-800">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link to="/" className="text-xl font-bold text-gray-900 dark:text-white">
          📘 Notes App
        </Link>

        <ThemeToggle />
      </div>
    </nav>
  );
}
