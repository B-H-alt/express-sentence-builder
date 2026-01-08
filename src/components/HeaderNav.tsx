import { Link } from "react-router-dom";
import { useState } from "react";

const HeaderNav = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="bg-secondary text-white fixed top-0 left-0 right-0 z-50">
      <nav className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">
            <img
              src="/handmade-logo.png"
              alt="Expressly Logo"
              className="h-10 w-auto"
            />
            <span className="font-bold text-xl">Expressly</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-10">
            <Link
              to="/about"
              className="font-semibold text-white/90 hover:text-white transition-colors"
            >
              About
            </Link>

            <Link
              to="/demo"
              className="font-semibold text-white/90 hover:text-white transition-colors"
            >
              Demo
            </Link>

            <Link
              to="/pecs-app"
              className="
                inline-flex items-center
                rounded-full
                -ml-2
                bg-white
                px-4 py-2
                text-sm font-semibold
                text-primary
                shadow-md
                transition-all
                hover:shadow-lg
              "
            >
              Open App →
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden inline-flex items-center justify-center rounded-lg p-2 hover:bg-white/10"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Dropdown */}
        {open && (
          <div className="md:hidden border-t border-white/10 bg-secondary">
            <div className="flex flex-col gap-4 px-4 py-6">
              <Link
                to="/about"
                className="font-semibold text-white/90 hover:text-white"
                onClick={() => setOpen(false)}
              >
                About
              </Link>

              <Link
                to="/demo"
                className="font-semibold text-white/90 hover:text-white"
                onClick={() => setOpen(false)}
              >
                Demo
              </Link>

              <Link
                to="/pecs-app"
                className="
                  inline-flex items-center justify-center
                  rounded-full
                  bg-white
                  px-4 py-2
                  text-sm font-semibold
                  text-primary
                  shadow-md
                "
                onClick={() => setOpen(false)}
              >
                Open App →
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};

export default HeaderNav;
