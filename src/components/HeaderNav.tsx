import { Link } from "react-router-dom";

const HeaderNav = () => {
  return (
    <header className="bg-secondary text-white fixed top-0 left-0 right-0 z-50">
      <nav className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src="/handmade-logo.png" alt="Expressly Logo" className="h-10 w-auto" />
            <span className="font-inter font-bold text-xl">Expressly</span>
          </Link>
          <div className="flex items-center gap-6">
            <Link to="/" className="font-inter font-medium hover:text-white/80 transition-colors">
              Home
            </Link>
            <Link to="/demo" className="font-inter font-medium hover:text-white/80 transition-colors">
              Demo
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default HeaderNav;
