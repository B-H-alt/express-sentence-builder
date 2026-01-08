import { Link } from "react-router-dom";

const HeaderNav = () => {
  return (
    <header className="bg-secondary text-white fixed top-0 left-0 right-0 z-50">
      <nav className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/handmade-logo.png" alt="Expressly Logo" className="h-10 w-auto" />
            <span className="font-bold text-xl">Expressly</span>
          </Link>

          <div className="flex items-center gap-10">
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
                -ml-2
                inline-flex items-center
                rounded-full
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
        </div>
      </nav>
    </header>
  );
};

export default HeaderNav;
