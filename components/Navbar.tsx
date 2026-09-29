import Link from "next/link";

import ThemeToggle from "./ThemeToggle";

const Navbar = () => {
  return (
    <>
      <nav className="app-nav" aria-label="Main navigation">
        <div className="nav-inner">
          <Link href="/" className="app-brand">
            Notes App <span className="brand-caption">A little learning, every day.</span>
          </Link>

          <ThemeToggle />
        </div>
      </nav>
    </>
  );
};

export default Navbar;
