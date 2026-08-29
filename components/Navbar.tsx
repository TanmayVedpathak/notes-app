import Link from "next/link";

import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  return (
    <>
      <nav className="border-b bg-white dark:bg-gray-900 dark:border-gray-800 h-full flex flex-col justify-center">
        <div className="mx-auto max-w-7xl w-full flex items-center justify-between px-6 ">
          <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">
            📘 Notes App
          </Link>

          <ThemeToggle />
        </div>
      </nav>
    </>
  );
};

export default Navbar;
